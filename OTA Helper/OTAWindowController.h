//
//  OTAWindowController.h
//  OTA Helper
//
//  Created by Yeung Yiu Hung on 17/3/15.
//  Copyright (c) 2015 Yeung Yiu Hung. All rights reserved.
//

#import <Cocoa/Cocoa.h>
#import <NMSSH/NMSSH.h>
#import "NMTask.h"
#import <MailCore/MailCore.h>
#import <ZXingObjC/ZXWriter.h>
#import <ZXingObjC/ZXMultiFormatWriter.h>
#import <ZXingObjC/ZXImage.h>
#define SAVED_INFO @"saveInfo_projects"
@interface OTAWindowController : NSWindowController{
    NSString *xcodeProjURL;
    NSString *exportURL;
    
    NSString *projectName;
    
    NSString *dateString;
    NSDate *now;
    bool isBuildSucess;
    
    NSString *qrString;
    
    NSString *indicatorStr;
    
    
}

@property (nonatomic) BOOL isRunning;

- (id)initWithIndicator:(NSString *)indicator;

@end
