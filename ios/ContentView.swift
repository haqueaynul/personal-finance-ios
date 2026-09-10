//
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

struct DashboardView: View {
    @EnvironmentObject var financeVM: FinanceViewModel
    
    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                // Card Balance Overview
                VStack(alignment: .leading, spacing: 12) {
                    Text("NET CASH FLOW")
                        .font(.caption)
                        .fontWeight(.semibold)
                        .foregroundColor(.secondary)
                    
                    Text("$\(String(format: "%.2f", financeVM.netSavings))")
                        .font(.system(size: 38, weight: .bold, design: .rounded))
                    
                    HStack(spacing: 24) {
                        VStack(alignment: .leading, spacing: 4) {
                            Text("Total Income").font(.caption).foregroundColor(.secondary)
                            Text("+$\(String(format: "%.2f", financeVM.totalIncome))")
                                .font(.subheadline.bold())
                                .foregroundColor(.green)
                        }
                        VStack(alignment: .leading, spacing: 4) {
                            Text("Total Expenses").font(.caption).foregroundColor(.secondary)
                            Text("-$\(String(format: "%.2f", financeVM.totalExpenses))")
                                .font(.subheadline.bold())
                                .foregroundColor(.red)
                        }
                        VStack(alignment: .leading, spacing: 4) {
                            Text("Savings Rate").font(.caption).foregroundColor(.secondary)
                            Text("\(Int(financeVM.savingsRate))%")
                                .font(.subheadline.bold())
                                .foregroundColor(.blue)
                        }
                    }
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(20)
                .background(Color(.secondarySystemBackground))
                .cornerRadius(16)
                .padding(.horizontal)
            }
            .padding(.top)
        }
        .navigationTitle("Summary")
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Button(action: { financeVM.isAddingTransaction = true }) {
                    Image(systemName: "plus.circle.fill")
                        .font(.title3)
                }
            }
        }
    }
}

struct ExpenseListView: View {
    @EnvironmentObject var financeVM: FinanceViewModel
    
    var body: some View {
        List {
            ForEach(financeVM.transactions) { tx in
                HStack {
                    VStack(alignment: .leading, spacing: 4) {
                        Text(tx.title).font(.headline)
                        Text(tx.paymentMethod.rawValue)
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                    Spacer()
                    Text("\(tx.type == .expense ? "-" : "+")$\(String(format: "%.2f", tx.amount))")
                        .fontWeight(.semibold)
                        .foregroundColor(tx.type == .expense ? .primary : .green)
                }
            }
            .onDelete(perform: financeVM.deleteTransaction)
        }
        .navigationTitle("Expenses")
    }
}

struct BudgetStatusView: View {
    @EnvironmentObject var financeVM: FinanceViewModel
    
    var body: some View {
        List(financeVM.categories.filter { $0.type == .expense }) { cat in
            let spent = financeVM.spendForCategory(cat.id)
            let percent = cat.monthlyBudget > 0 ? (spent / cat.monthlyBudget) * 100 : 0
            
            VStack(alignment: .leading, spacing: 8) {
                HStack {
                    Text(cat.name).font(.headline)
                    Spacer()
                    Text("$\(String(format: "%.0f", spent)) / $\(String(format: "%.0f", cat.monthlyBudget))")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                }
                ProgressView(value: min(1.0, spent / max(1, cat.monthlyBudget)))
                    .tint(percent >= 100 ? .red : (percent >= 85 ? .orange : .blue))
            }
            .padding(.vertical, 4)
        }
        .navigationTitle("Budgets")
    }
}

struct AlertsInboxView: View {
    @EnvironmentObject var alertEngine: BudgetAlertEngine
    
    var body: some View {
        List(alertEngine.activeAlerts) { alert in
            VStack(alignment: .leading, spacing: 6) {
                HStack {
                    Circle()
                        .fill(alert.severity.color)
                        .frame(width: 8, height: 8)
                    Text(alert.title)
                        .font(.headline)
                }
                Text(alert.message)
                    .font(.subheadline)
                    .foregroundColor(.secondary)
            }
            .padding(.vertical, 4)
        }
        .navigationTitle("Budget Alerts")
    }
}
