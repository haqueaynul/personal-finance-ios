//
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
                print("Notification authorization error: \(error.localizedDescription)")
            }
        }
    }
}
