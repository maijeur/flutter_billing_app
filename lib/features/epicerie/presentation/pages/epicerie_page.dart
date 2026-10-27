import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/data/hive_database.dart';
import '../../../product/data/models/product_model.dart';
import '../../../product/domain/entities/product.dart';
import '../../../product/presentation/bloc/product_bloc.dart';

class EpiceriePage extends StatefulWidget {
  const EpiceriePage({super.key});
  @override
  State<EpiceriePage> createState() => _EpiceriePageState();
}
class _EpiceriePageState extends State<EpiceriePage> {
  static const salesKey = 'epicerie_sales_v1', creditsKey = 'epicerie_credits_v1';
  final formKey = GlobalKey<FormState>();
  final qty = TextEditingController(text: '1'), customer = TextEditingController(), paid = TextEditingController();
  String? productId;
  String payment = 'Espèces';
  bool saving = false;
  List<Map<String, dynamic>> read(String key) {
    final raw = HiveDatabase.settingsBox.get(key);
    if (raw is! List) return [];
    return raw.whereType<Map>().map((m) => Map<String, dynamic>.from(m)).toList();
  }
  List<Map<String, dynamic>> get sales => read(salesKey);
  List<Map<String, dynamic>> get credits => read(creditsKey);
  double n(dynamic v) => v is num ? v.toDouble() : double.tryParse('$v') ?? 0;
  String money(double v) => v.toStringAsFixed(3) + ' TND';
  @override
  void dispose() { qty.dispose(); customer.dispose(); paid.dispose(); super.dispose(); }

  Future<void> saveSale(List<Product> products) async {
    if (!formKey.currentState!.validate()) return;
    final found = products.where((p) => p.id == productId);
    if (found.isEmpty) return;
    final p = found.first, count = int.parse(qty.text.trim());
    if (count > p.stock) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Stock insuffisant : ' + p.stock.toString() + ' disponible(s).')));
      return;
    }
    final total = p.price * count;
    final received = payment == 'Espèces' ? total : (paid.text.trim().isEmpty ? 0 : double.tryParse(paid.text.replaceAll(',', '.')) ?? -1);
    if (received < 0 || received > total) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Montant payé invalide.'))); return;
    }
    if (payment == 'À crédit' && customer.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Le nom du client est obligatoire.'))); return;
    }
    setState(() => saving = true);
    try {
      final id = DateTime.now().microsecondsSinceEpoch.toString();
      final list = sales;
      list.add({'id': id, 'productId': p.id, 'productName': p.name, 'quantity': count,
        'total': total, 'paid': received, 'paymentType': payment, 'customer': customer.text.trim(),
        'date': DateTime.now().toIso8601String()});
      await HiveDatabase.settingsBox.put(salesKey, list);
      if (payment == 'À crédit' && received < total) {
        final debts = credits;
        debts.add({'id': id, 'customer': customer.text.trim(), 'description': count.toString() + ' x ' + p.name,
          'total': total, 'paid': received, 'balance': total - received, 'date': DateTime.now().toIso8601String()});
        await HiveDatabase.settingsBox.put(creditsKey, debts);
      }
      await HiveDatabase.productBox.put(p.id, ProductModel(id: p.id, name: p.name,
        barcode: p.barcode, price: p.price, stock: p.stock - count));
      if (!mounted) return;
      context.read<ProductBloc>().add(LoadProducts());
      setState(() { saving = false; productId = null; payment = 'Espèces'; qty.text = '1'; });
      customer.clear(); paid.clear();
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Vente enregistrée, stock mis à jour.'), backgroundColor: Colors.green));
    } catch (e) {
      if (mounted) { setState(() => saving = false); ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Erreur : ' + e.toString()))); }
    }
  }

  Future<void> collect(int index, Map<String, dynamic> credit) async {
    final ctrl = TextEditingController();
    final amount = await showDialog<double>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text('Paiement de ${credit['customer']}'),
        content: TextField(
          controller: ctrl,
          keyboardType: const TextInputType.numberWithOptions(decimal: true),
          decoration: const InputDecoration(
            labelText: 'Montant reçu (DT)',
            hintText: 'Ex. : 10,000',
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Annuler'),
          ),
          FilledButton(
            onPressed: () {
              final value = double.tryParse(ctrl.text.replaceAll(',', '.'));
              if (value != null && value > 0) Navigator.pop(ctx, value);
            },
            child: const Text('Enregistrer'),
          ),
        ],
      ),
    );
    ctrl.dispose();
    if (amount == null) return;

    final creditList = credits;
    final updatedCredit = Map<String, dynamic>.from(creditList[index]);
    final balance = n(updatedCredit['balance']);
    if (amount > balance) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Le paiement dépasse le solde restant.')),
        );
      }
      return;
    }

    updatedCredit['paid'] = n(updatedCredit['paid']) + amount;
    updatedCredit['balance'] = balance - amount;
    creditList[index] = updatedCredit;
    await HiveDatabase.settingsBox.put(creditsKey, creditList);

    // Reflect later credit collections in the daily "Encaissé" total as well.
    final saleList = sales;
    final saleIndex = saleList.indexWhere((sale) => sale['id'] == updatedCredit['id']);
    if (saleIndex >= 0) {
      final updatedSale = Map<String, dynamic>.from(saleList[saleIndex]);
      updatedSale['paid'] = n(updatedSale['paid']) + amount;
      saleList[saleIndex] = updatedSale;
      await HiveDatabase.settingsBox.put(salesKey, saleList);
    }

    if (mounted) {
      setState(() {});
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Paiement du crédit enregistré.'),
          backgroundColor: Colors.green,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(title: const Text('Gestion épicerie'), leading: IconButton(icon: const Icon(Icons.arrow_back), onPressed: () => context.pop()),
      actions: [IconButton(tooltip: 'Articles et stock', icon: const Icon(Icons.inventory_2_outlined), onPressed: () => context.push('/products'))]),
    body: BlocBuilder<ProductBloc, ProductState>(builder: (context, state) {
      final products = state.products;
      if (products.isNotEmpty && (productId == null || !products.any((p) => p.id == productId))) productId = products.first.id;
      final now = DateTime.now();
      final today = sales.where((s) { final d = DateTime.tryParse(s['date'].toString()); return d != null && d.year == now.year && d.month == now.month && d.day == now.day; }).toList();
      final total = today.fold<double>(0, (sum, s) => sum + n(s['total']));
      final received = today.fold<double>(0, (sum, s) => sum + n(s['paid']));
      final balance = credits.fold<double>(0, (sum, c) => sum + n(c['balance']));
      final open = credits.asMap().entries.where((e) => n(e.value['balance']) > 0).toList();
      return ListView(padding: const EdgeInsets.all(16), children: [
        const Text('Aujourd’hui', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
        Row(children: [Expanded(child: metric('Ventes', money(total), Icons.shopping_basket)), Expanded(child: metric('Encaissé', money(received), Icons.payments))]),
        Row(children: [Expanded(child: metric('Crédit restant', money(balance), Icons.account_balance_wallet)), Expanded(child: metric('Stock bas', products.where((p) => p.stock <= 5).length.toString() + ' article(s)', Icons.warning_amber))]),
        const SizedBox(height: 20),
        const Text('Enregistrer une vente', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
        if (products.isEmpty) Card(child: Padding(padding: const EdgeInsets.all(16), child: Column(children: [
          const Text('Ajoutez d’abord vos articles et leurs quantités en stock.'),
          FilledButton(onPressed: () => context.push('/products/add'), child: const Text('Ajouter un article')),
        ]))) else Card(child: Padding(padding: const EdgeInsets.all(16), child: Form(key: formKey, child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
          DropdownButtonFormField<String>(value: productId, decoration: const InputDecoration(labelText: 'Produit'),
            items: products.map((p) => DropdownMenuItem(value: p.id, child: Text(p.name + ' — stock ' + p.stock.toString(), overflow: TextOverflow.ellipsis))).toList(), onChanged: (v) => setState(() => productId = v)),
          TextFormField(controller: qty, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'Quantité vendue'),
            validator: (v) { final count = int.tryParse(v ?? ''); return count == null || count < 1 ? 'Quantité invalide' : null; }),
          DropdownButtonFormField<String>(value: payment, decoration: const InputDecoration(labelText: 'Paiement'),
            items: const [DropdownMenuItem(value: 'Espèces', child: Text('Espèces / payé')), DropdownMenuItem(value: 'À crédit', child: Text('À crédit — el kridi'))],
            onChanged: (v) => setState(() => payment = v ?? 'Espèces')),
          if (payment == 'À crédit') ...[
            TextFormField(controller: customer, decoration: const InputDecoration(labelText: 'Nom du client'),
              validator: (v) => payment == 'À crédit' && (v == null || v.trim().isEmpty) ? 'Nom obligatoire' : null),
            TextFormField(controller: paid, keyboardType: const TextInputType.numberWithOptions(decimal: true),
              decoration: const InputDecoration(labelText: 'Montant payé maintenant (TND)', hintText: '0 si rien')),
          ],
          if (productId != null && products.any((p) => p.id == productId)) Text('Prix unitaire : ' + money(products.firstWhere((p) => p.id == productId).price)),
          const SizedBox(height: 10),
          FilledButton.icon(onPressed: saving ? null : () => saveSale(products), icon: const Icon(Icons.check_circle_outline), label: Text(saving ? 'Enregistrement…' : 'Enregistrer la vente')),
        ])))),
        const SizedBox(height: 20),
        Text('Crédit client — el kridi (' + open.length.toString() + ')', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
        if (open.isEmpty) const Card(child: Padding(padding: EdgeInsets.all(16), child: Text('Aucun crédit en cours.')))
        else ...open.map((e) => Card(child: ListTile(title: Text(e.value['customer'].toString()),
          subtitle: Text(e.value['description'].toString() + '\nReste : ' + money(n(e.value['balance']))), isThreeLine: true,
          trailing: IconButton(icon: const Icon(Icons.payments_outlined), onPressed: () => collect(e.key, e.value))))),
        const SizedBox(height: 20),
        const Text('Dernières ventes', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
        if (sales.isEmpty) const Card(child: Padding(padding: EdgeInsets.all(16), child: Text('Les ventes enregistrées apparaîtront ici.')))
        else ...sales.reversed.take(10).map((s) => Card(child: ListTile(title: Text(s['productName'].toString() + ' × ' + s['quantity'].toString()),
          subtitle: Text(s['paymentType'].toString() + ' · ' + (s['customer'] ?? '').toString()), trailing: Text(money(n(s['total'])))))),
      ]);
    }),
  );

  Widget metric(String title, String value, IconData icon) {
    final accent = title == 'Stock bas'
        ? const Color(0xFFD97706)
        : Theme.of(context).colorScheme.primary;
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: 36,
              height: 36,
              decoration: BoxDecoration(
                color: accent.withValues(alpha: 0.10),
                borderRadius: BorderRadius.circular(11),
              ),
              alignment: Alignment.center,
              child: Icon(icon, color: accent, size: 20),
            ),
            const SizedBox(height: 12),
            Text(
              title,
              style: TextStyle(
                fontSize: 12,
                color: Colors.grey[600],
                fontWeight: FontWeight.w500,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              value,
              style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ),
      ),
    );
  }
}
