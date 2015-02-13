//
//  OTASettingViewController.h
//  OTA Helper
//
//  Created by Yeung Yiu Hung on 24/1/15.
//  Copyright (c) 2015 Yeung Yiu Hung. All rights reserved.
//

#import <Cocoa/Cocoa.h>

@interface OTASettingViewController : NSViewController{
    NSString *xcodeProjURL;
    NSString *exportURL;
    
    NSString *projectName;
    
    NSString *dateString;
    NSDate *now;
    bool isBuildSucess;
    
    NSString *qrString;
}

@end
