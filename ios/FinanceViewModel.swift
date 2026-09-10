//
//  FinanceViewModel.swift
//  PersonalFinanceiOS
//

import SwiftUI
import Combine

@MainActor
public class FinanceViewModel: ObservableObject {
    @Published public var transactions: [Transaction] = []
    @Published public var categories: [Category] = []
    @Published public var overallMonthlyBudget: Double = 4050.0
    @Published public var selectedTab: Int = 0
    @Published public var isAddingTransaction: Bool = false
    
    public init() {
        loadInitialData()
    }
    
    // Financial Metrics Computations
    public var totalIncome: Double {
        transactions
            .filter { $0.type == .income }
            .reduce(0) { $0 + $1.amount }
    }
    
    public var totalExpenses: Double {
        transactions
            .filter { $0.type == .expense }
            .reduce(0) { $0 + $1.amount }
    }
    
    public var netSavings: Double {
        totalIncome - totalExpenses
    }
    
    public var savingsRate: Double {
        guard totalIncome > 0 else { return 0 }
        return max(0, (netSavings / totalIncome) * 100)
    }
    
    public func spendForCategory(_ categoryId: String) -> Double {
        transactions
            .filter { $0.type == .expense && $0.categoryId == categoryId }
            .reduce(0) { $0 + $1.amount }
    }
    
    public func addTransaction(_ tx: Transaction) {
        withAnimation(.spring(response: 0.35, dampingFraction: 0.8)) {
            transactions.insert(tx, at: 0)
        }
        saveToDisk()
    }
    
    public func deleteTransaction(at offsets: IndexSet) {
        withAnimation {
            transactions.remove(atOffsets: offsets)
        }
        saveToDisk()
    }
    
    public func updateCategoryBudget(id: String, newBudget: Double) {
        if let idx = categories.firstIndex(where: { $0.id == id }) {
            categories[idx].monthlyBudget = newBudget
            saveToDisk()
        }
    }
    
    private func saveToDisk() {
        if let encoded = try? JSONEncoder().encode(transactions) {
            UserDefaults.standard.set(encoded, forKey: "saved_transactions")
        }
    }
    
    private func loadInitialData() {
        // Load starter categories
        self.categories = [
            Category(id: "food", name: "Food & Dining", icon: "fork.knife", colorHex: "#FF9500", monthlyBudget: 600, type: .expense),
            Category(id: "groceries", name: "Groceries", icon: "cart.fill", colorHex: "#34C759", monthlyBudget: 500, type: .expense),
            Category(id: "housing", name: "Housing & Rent", icon: "house.fill", colorHex: "#007AFF", monthlyBudget: 1800, type: .expense),
            Category(id: "transport", name: "Transportation", icon: "car.fill", colorHex: "#5856D6", monthlyBudget: 250, type: .expense),
            Category(id: "shopping", name: "Shopping", icon: "bag.fill", colorHex: "#FF2D55", monthlyBudget: 300, type: .expense),
            Category(id: "utilities", name: "Utilities & Bills", icon: "bolt.fill", colorHex: "#FFCC00", monthlyBudget: 220, type: .expense),
            Category(id: "salary", name: "Salary", icon: "briefcase.fill", colorHex: "#34C759", monthlyBudget: 0, type: .income)
        ]
    }
}
