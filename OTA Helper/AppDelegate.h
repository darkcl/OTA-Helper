//
//  AppDelegate.h
//  OTA Helper
//
//  Created by Yeung Yiu Hung on 8/1/15.
//  Copyright (c) 2015 Yeung Yiu Hung. All rights reserved.
//

#import <Cocoa/Cocoa.h>

@interface AppDelegate : NSObject <NSApplicationDelegate>{
    NSString *xcodeProjURL;
    NSString *exportURL;
    
    NSString *projectName;
    
    NSString *dateString;
    
    bool isBuildSucess;
}

@property (nonatomic) BOOL isRunning;

@end

