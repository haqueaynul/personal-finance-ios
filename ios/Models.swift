//
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
