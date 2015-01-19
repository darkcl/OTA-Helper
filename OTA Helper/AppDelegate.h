//
//  AppDelegate.h
//  OTA Helper
//
//  Created by Yeung Yiu Hung on 8/1/15.
//  Copyright (c) 2015 Yeung Yiu Hung. All rights reserved.
//

#import <Cocoa/Cocoa.h>
#import <NMSSH/NMSSH.h>
#import "NMTask.h"
#import <MailCore/MailCore.h>
#import <ZXingObjC/ZXWriter.h>
#import <ZXingObjC/ZXMultiFormatWriter.h>
#import <ZXingObjC/ZXImage.h>

@interface AppDelegate : NSObject <NSApplicationDelegate>{
    NSString *xcodeProjURL;
    NSString *exportURL;
    
    NSString *projectName;
    
    NSString *dateString;
    NSDate *now;
    bool isBuildSucess;
    
    NSString *qrString;
}

@property (nonatomic) BOOL isRunning;

@end

