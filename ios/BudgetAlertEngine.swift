//
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
                    id: "alert-over-\(category.id)",
                    categoryId: category.id,
                    categoryName: category.name,
                    title: "Overbudget: \(category.name)",
                    message: "Exceeded budget by $\(String(format: "%.2f", abs(remaining))). Current spend is $\(String(format: "%.2f", totalSpent)).",
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
                    id: "alert-crit-\(category.id)",
                    categoryId: category.id,
                    categoryName: category.name,
                    title: "Critical Alert: \(category.name) at \(Int(percentage))%",
                    message: "You have used \(Int(percentage))% of your budget. Only $\(String(format: "%.2f", remaining)) remaining.",
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
                        id: "alert-velocity-\(category.id)",
                        categoryId: category.id,
                        categoryName: category.name,
                        title: "Spend Velocity Warning",
                        message: "At $\(String(format: "%.2f", dailyRate))/day, you will exhaust \(category.name) in \(daysLeftUntilBust) days.",
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
