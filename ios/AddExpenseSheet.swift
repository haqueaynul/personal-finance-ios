//
//  AddExpenseSheet.swift
//  PersonalFinanceiOS
//

import SwiftUI

struct AddExpenseSheet: View {
    @Environment(\.dismiss) var dismiss
    @EnvironmentObject var financeVM: FinanceViewModel
    @EnvironmentObject var alertEngine: BudgetAlertEngine
    
    @State private var title: String = ""
    @State private var amountString: String = ""
    @State private var selectedType: TransactionType = .expense
    @State private var selectedCategoryId: String = "food"
    @State private var paymentMethod: PaymentMethod = .applePay
    @State private var date: Date = Date()
    @State private var notes: String = ""
    
    var body: some View {
        NavigationStack {
            Form {
                Section("Amount & Title") {
                    TextField("Merchant or Description", text: $title)
                    HStack {
                        Text("$").font(.title2).foregroundColor(.secondary)
                        TextField("0.00", text: $amountString)
                            .keyboardType(.decimalPad)
                            .font(.title2.bold())
                    }
                    Picker("Type", selection: $selectedType) {
                        Text("Expense").tag(TransactionType.expense)
                        Text("Income").tag(TransactionType.income)
                    }
                    .pickerStyle(.segmented)
                }
                
                Section("Category") {
                    Picker("Category", selection: $selectedCategoryId) {
                        ForEach(financeVM.categories) { cat in
                            Text(cat.name).tag(cat.id)
                        }
                    }
                }
                
                Section("Details") {
                    Picker("Payment Method", selection: $paymentMethod) {
                        ForEach(PaymentMethod.allCases, id: \.self) { method in
                            Label(method.rawValue, systemImage: method.iconName).tag(method)
                        }
                    }
                    DatePicker("Date", selection: $date, displayedComponents: .date)
                    TextField("Notes (Optional)", text: $notes)
                }
            }
            .navigationTitle("New Transaction")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") {
                        saveTransaction()
                    }
                    .bold()
                    .disabled(title.isEmpty || Double(amountString) == nil)
                }
            }
        }
    }
    
    private func saveTransaction() {
        guard let amount = Double(amountString) else { return }
        let newTx = Transaction(
            title: title,
            amount: amount,
            type: selectedType,
            categoryId: selectedCategoryId,
            date: date,
            paymentMethod: paymentMethod,
            notes: notes.isEmpty ? nil : notes
        )
        financeVM.addTransaction(newTx)
        alertEngine.evaluateAlerts(
            transactions: financeVM.transactions,
            categories: financeVM.categories,
            monthlyBudget: financeVM.overallMonthlyBudget
        )
        dismiss()
    }
}
