import { SwiftCodeFile } from '../types';

export const GENERATED_SWIFT_FILES: SwiftCodeFile[] = [
  {
    name: 'App Entry Point',
    filename: 'PersonalFinanceApp.swift',
    description: 'Main iOS 18 SwiftUI application lifecycle with SwiftData & Notification center setup',
    code: `//
//  PersonalFinanceApp.swift
//  PersonalFinanceiOS
//
//  Created for iOS 18 / Xcode 16 with SwiftData and UserNotifications
//

import SwiftUI
import UserNotifications

@main
struct PersonalFinanceApp: App {
    @StateObject private var financeVM = FinanceViewModel()
    @StateObject private var alertEngine = BudgetAlertEngine()
    
    init() {
        requestNotificationAuthorization()
    }
    
    var body: some Scene {
        WindowGroup {
            MainTabView()
                .environmentObject(financeVM)
                .environmentObject(alertEngine)
                .preferredColorScheme(.light)
        }
    }
    
    private func requestNotificationAuthorization() {
        UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .badge, .sound]) { granted, error in
            if granted {
                print("Notification permissions granted for automated budget alerts.")
            } else if let error = error {
                print("Notification authorization error: \\(error.localizedDescription)")
            }
        }
    }
}
`
  },
  {
    name: 'Data Models',
    filename: 'Models.swift',
    description: 'Swift models conforming to Identifiable, Codable, and Sendable',
    code: `//
//  Models.swift
//  PersonalFinanceiOS
//

import Foundation
import SwiftUI

public enum TransactionType: String, Codable, CaseIterable, Sendable {
    case expense = "Expense"
    case income = "Income"
}

public enum PaymentMethod: String, Codable, CaseIterable, Sendable {
    case applePay = "Apple Pay"
    case creditCard = "Credit Card"
    case debitCard = "Debit Card"
    case cash = "Cash"
    case bankTransfer = "Bank Transfer"
    
    public var iconName: String {
        switch self {
        case .applePay: return "applelogo"
        case .creditCard: return "creditcard.fill"
        case .debitCard: return "creditcard"
        case .cash: return "banknote.fill"
        case .bankTransfer: return "building.columns.fill"
        }
    }
}

public struct Category: Identifiable, Codable, Sendable {
    public let id: String
    public var name: String
    public var icon: String
    public var colorHex: String
    public var monthlyBudget: Double
    public var type: TransactionType
    
    public var color: Color {
        Color(hex: colorHex) ?? .blue
    }
}

public struct Transaction: Identifiable, Codable, Sendable {
    public var id: UUID = UUID()
    public var title: String
    public var amount: Double
    public var type: TransactionType
    public var categoryId: String
    public var date: Date
    public var paymentMethod: PaymentMethod
    public var notes: String?
    public var merchant: String?
    public var isRecurring: Bool = false
    public var createdAt: Date = Date()
}

public enum AlertSeverity: String, Codable, Sendable {
    case info
    case caution
    case critical
    case danger
    
    public var color: Color {
        switch self {
        case .info: return .blue
        case .caution: return .yellow
        case .critical: return .orange
        case .danger: return .red
        }
    }
}

public struct BudgetAlert: Identifiable, Codable, Sendable {
    public var id: String
    public var categoryId: String?
    public var categoryName: String?
    public var title: String
    public var message: String
    public var percentage: Double?
    public var currentSpend: Double?
    public var budgetLimit: Double?
    public var severity: AlertSeverity
    public var timestamp: Date
    public var isRead: Bool
    public var isResolved: Bool
}

// Color Hex Initializer extension
extension Color {
    init?(hex: String) {
        var hexSanitized = hex.trimmingCharacters(in: .whitespacesAndNewlines)
        hexSanitized = hexSanitized.replacingOccurrences(of: "#", with: "")
        var rgb: UInt64 = 0
        guard Scanner(string: hexSanitized).scanHexInt64(&rgb) else { return nil }
        self.init(
            .sRGB,
            red: Double((rgb >> 16) & 0xFF) / 255.0,
            green: Double((rgb >> 8) & 0xFF) / 255.0,
            blue: Double(rgb & 0xFF) / 255.0,
            opacity: 1.0
        )
    }
}
`
  },
  {
    name: 'View Model & State',
    filename: 'FinanceViewModel.swift',
    description: 'SwiftUI ObservableObject with state management and persistence',
    code: `//
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
`
  },
  {
    name: 'Automated Budget Alerts Engine',
    filename: 'BudgetAlertEngine.swift',
    description: 'Background calculation engine evaluating budget thresholds & scheduling local push notifications',
    code: `//
//  BudgetAlertEngine.swift
//  PersonalFinanceiOS
//

import SwiftUI
import UserNotifications

@MainActor
public class BudgetAlertEngine: ObservableObject {
    @Published public var activeAlerts: [BudgetAlert] = []
    @Published public var unreadCount: Int = 0
    
    // Configurable thresholds
    @Published public var cautionThreshold: Double = 75.0   // 75%
    @Published public var criticalThreshold: Double = 90.0  // 90%
    @Published public var overbudgetThreshold: Double = 100.0
    @Published public var velocityAlertsEnabled: Bool = true
    @Published public var largeTransactionThreshold: Double = 250.0
    
    public func evaluateAlerts(transactions: [Transaction], categories: [Category], monthlyBudget: Double) {
        var newAlerts: [BudgetAlert] = []
        let calendar = Calendar.current
        let now = Date()
        let dayOfMonth = calendar.component(.day, from: now)
        let daysInMonth = calendar.range(of: .day, in: .month, for: now)?.count ?? 30
        
        for category in categories where category.type == .expense && category.monthlyBudget > 0 {
            let totalSpent = transactions
                .filter { $0.type == .expense && $0.categoryId == category.id }
                .reduce(0) { $0 + $1.amount }
            
            let percentage = (totalSpent / category.monthlyBudget) * 100.0
            let remaining = category.monthlyBudget - totalSpent
            
            // 1. Overbudget Threshold
            if percentage >= overbudgetThreshold {
                let alert = BudgetAlert(
                    id: "alert-over-\\(category.id)",
                    categoryId: category.id,
                    categoryName: category.name,
                    title: "Overbudget: \\(category.name)",
                    message: "Exceeded budget by $\\(String(format: "%.2f", abs(remaining))). Current spend is $\\(String(format: "%.2f", totalSpent)).",
                    percentage: percentage,
                    currentSpend: totalSpent,
                    budgetLimit: category.monthlyBudget,
                    severity: .danger,
                    timestamp: Date(),
                    isRead: false,
                    isResolved: false
                )
                newAlerts.append(alert)
                triggerPushNotification(alert: alert)
            }
            // 2. Critical Threshold
            else if percentage >= criticalThreshold {
                let alert = BudgetAlert(
                    id: "alert-crit-\\(category.id)",
                    categoryId: category.id,
                    categoryName: category.name,
                    title: "Critical Alert: \\(category.name) at \\(Int(percentage))%",
                    message: "You have used \\(Int(percentage))% of your budget. Only $\\(String(format: "%.2f", remaining)) remaining.",
                    percentage: percentage,
                    currentSpend: totalSpent,
                    budgetLimit: category.monthlyBudget,
                    severity: .critical,
                    timestamp: Date(),
                    isRead: false,
                    isResolved: false
                )
                newAlerts.append(alert)
                triggerPushNotification(alert: alert)
            }
            // 3. Velocity Forecast
            if velocityAlertsEnabled && percentage >= 50 && percentage < overbudgetThreshold {
                let dailyRate = totalSpent / Double(max(1, dayOfMonth))
                let projected = dailyRate * Double(daysInMonth)
                if projected > category.monthlyBudget * 1.15 {
                    let daysLeftUntilBust = Int(remaining / dailyRate)
                    let alert = BudgetAlert(
                        id: "alert-velocity-\\(category.id)",
                        categoryId: category.id,
                        categoryName: category.name,
                        title: "Spend Velocity Warning",
                        message: "At $\\(String(format: "%.2f", dailyRate))/day, you will exhaust \\(category.name) in \\(daysLeftUntilBust) days.",
                        percentage: percentage,
                        severity: .caution,
                        timestamp: Date(),
                        isRead: false,
                        isResolved: false
                    )
                    newAlerts.append(alert)
                }
            }
        }
        
        self.activeAlerts = newAlerts
        self.unreadCount = newAlerts.filter { !$0.isRead }.count
    }
    
    private func triggerPushNotification(alert: BudgetAlert) {
        let content = UNMutableNotificationContent()
        content.title = alert.title
        content.body = alert.message
        content.sound = .defaultCritical
        content.badge = NSNumber(value: unreadCount + 1)
        
        let trigger = UNTimeIntervalNotificationTrigger(timeInterval: 1, repeats: false)
        let request = UNNotificationRequest(identifier: alert.id, content: content, trigger: trigger)
        UNUserNotificationCenter.current().add(request)
    }
}
`
  },
  {
    name: 'Main Tab View UI',
    filename: 'ContentView.swift',
    description: 'Native iOS 18 SwiftUI Navigation Bar and TabBar implementation',
    code: `//
//  ContentView.swift
//  PersonalFinanceiOS
//

import SwiftUI

struct MainTabView: View {
    @EnvironmentObject var financeVM: FinanceViewModel
    @EnvironmentObject var alertEngine: BudgetAlertEngine
    
    var body: some View {
        TabView(selection: $financeVM.selectedTab) {
            NavigationStack {
                DashboardView()
            }
            .tabItem {
                Label("Home", systemImage: "chart.pie.fill")
            }
            .tag(0)
            
            NavigationStack {
                ExpenseListView()
            }
            .tabItem {
                Label("Expenses", systemImage: "list.bullet.rectangle.portrait.fill")
            }
            .tag(1)
            
            NavigationStack {
                BudgetStatusView()
            }
            .tabItem {
                Label("Budgets", systemImage: "target")
            }
            .tag(2)
            
            NavigationStack {
                AlertsInboxView()
            }
            .tabItem {
                Label("Alerts", systemImage: "bell.badge.fill")
            }
            .badge(alertEngine.unreadCount)
            .tag(3)
        }
        .tint(.blue)
        .sheet(isPresented: $financeVM.isAddingTransaction) {
            AddExpenseSheet()
        }
    }
}
`
  },
  {
    name: 'Add Expense Sheet View',
    filename: 'AddExpenseSheet.swift',
    description: 'SwiftUI form for logging expenses with Apple Pay and category selection',
    code: `//
//  AddExpenseSheet.swift
//  PersonalFinanceiOS
//

import SwiftUI

struct AddExpenseSheet: View {
    @Environment(\\.dismiss) var dismiss
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
                        ForEach(PaymentMethod.allCases, id: \\.self) { method in
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
`
  }
];
