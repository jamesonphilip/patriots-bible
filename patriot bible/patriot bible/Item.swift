//
//  Item.swift
//  patriot bible
//
//  Created by Jameson on 3/8/26.
//

import Foundation
import SwiftData

@Model
final class Item {
    var timestamp: Date
    
    init(timestamp: Date) {
        self.timestamp = timestamp
    }
}
