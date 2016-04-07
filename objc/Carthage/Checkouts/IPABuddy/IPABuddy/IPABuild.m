//
//  IPABuild.m
//  IPABuddy
//
//  Created by Yeung Yiu Hung on 6/4/2016.
//  Copyright © 2016 darkcl. All rights reserved.
//

#import "IPABuild.h"

@implementation IPABuild

+ (void)exportPlistForIPA:(NSString *)ipaName
               targetName:(NSString *)target
                   inPath:(NSString *)currentDirectoryPath
                   domain:(NSString *)domain
                  success:(void(^)(void))success
                 progress:(void(^)(NSString *logs))progress
                  failure:(void(^)(NSException *err))failure{
    dispatch_queue_t taskQueue = dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_BACKGROUND, 0);
    dispatch_async(taskQueue, ^{
        bool isExportSucess = YES;
        @try {
            
            NSString *path  = [NSString stringWithFormat:@"%@", [[NSBundle bundleForClass:[self class]] pathForResource:@"otabuddy" ofType:@"sh"]];
            
            NSTask *buildTask = [[NSTask alloc] init];
            buildTask.launchPath = path;
            buildTask.currentDirectoryPath = currentDirectoryPath;
            NSArray *arg = @[@"plist",
                             [NSString stringWithFormat:@"%@.ipa", ipaName],
                             [domain stringByAppendingPathComponent:[NSString stringWithFormat:@"%@.ipa", ipaName]],
                             [NSString stringWithFormat:@"%@.plist",ipaName],
                             target];
            NSLog(@"%@",arg);
            buildTask.arguments = arg;
            
            // Output Handling
            NSPipe *outputPipe = [[NSPipe alloc] init];
            buildTask.standardOutput = outputPipe;
            
            [[outputPipe fileHandleForReading] waitForDataInBackgroundAndNotify];
            
            [[NSNotificationCenter defaultCenter] addObserverForName:NSFileHandleDataAvailableNotification object:[outputPipe fileHandleForReading] queue:nil usingBlock:^(NSNotification *notification){
                
                NSData *output = [[outputPipe fileHandleForReading] availableData];
                NSString *outStr = [[NSString alloc] initWithData:output encoding:NSUTF8StringEncoding];
                dispatch_async(dispatch_get_main_queue(), ^{
                    progress(outStr);
                });
                
                [[outputPipe fileHandleForReading] waitForDataInBackgroundAndNotify];
            }];
            
            
            [buildTask launch];
            
            [buildTask waitUntilExit];
        }
        @catch (NSException *exception) {
            NSLog(@"Problem Running Task: %@", [exception description]);
            isExportSucess = NO;
            dispatch_async(dispatch_get_main_queue(), ^{
                failure(exception);
            });
        }
        @finally {
            dispatch_async(dispatch_get_main_queue(), ^{
                if (isExportSucess) {
                    success();
                }
            });
        }
    });
}

+ (void)buildWithProjectPath:(NSString *)path
                      scheme:(NSString *)scheme
                      config:(NSString *)config
                      target:(NSString *)target
                  exportPath:(NSString *)exportPath
                      domain:(NSString *)domain
                   provision:(NSString *)provision
                     ipaName:(NSString *)ipaName
                     success:(void(^)(void))success
                    progress:(void(^)(NSString *logs))progress
                     failure:(void(^)(NSException *err))failure{
    //    (
    //     Facesss,
    //     Facesss App Developement,
    //     /Users/yeungyiuhung/Documents/Workspace/facesss-ios,
    //     /Users/yeungyiuhung/Documents/OTA Build/Facesss-Dev,
    //     201604061202,
    //     Facesss,
    //     Facesss.xcworkspace
    //     )
    NSString *xcodeProjURL;
    if ([path rangeOfString:@"xcworkspace"].location != NSNotFound) {
        xcodeProjURL = path;
    }else{
        xcodeProjURL = [NSString stringWithFormat:@"%@/project.xcworkspace", path];
    }
    
    NSDateFormatter *dateFormatter = [[NSDateFormatter alloc] init];
    [dateFormatter setLocale:[NSLocale currentLocale]];
    [dateFormatter setDateFormat: @"yyyyMMddHHmm"];
    NSDate *now = [NSDate date];
    NSString *dateString = [dateFormatter stringFromDate:now];
    NSString *shellpath  = [NSString stringWithFormat:@"%@", [[NSBundle bundleForClass:[self class]] pathForResource:@"BuildScript" ofType:@"sh"]];
    
    NSArray *args = @[scheme, provision, path, exportPath, dateString, ipaName, xcodeProjURL, config];
    
    dispatch_queue_t taskQueue = dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_BACKGROUND, 0);
    dispatch_async(taskQueue, ^{
        bool isBuildSucess = YES;
        @try {
            NSTask *buildTask = [[NSTask alloc] init];
            [buildTask setLaunchPath:shellpath];
            buildTask.arguments  = args;
            
            // Output Handling
            NSPipe *outputPipe = [[NSPipe alloc] init];
            buildTask.standardOutput = outputPipe;
            
            [[outputPipe fileHandleForReading] waitForDataInBackgroundAndNotify];
            
            [[NSNotificationCenter defaultCenter] addObserverForName:NSFileHandleDataAvailableNotification object:[outputPipe fileHandleForReading] queue:nil usingBlock:^(NSNotification *notification){
                
                NSData *output = [[outputPipe fileHandleForReading] availableData];
                NSString *outStr = [[NSString alloc] initWithData:output encoding:NSUTF8StringEncoding];
                dispatch_async(dispatch_get_main_queue(), ^{
                    progress(outStr);
                });
                
                [[outputPipe fileHandleForReading] waitForDataInBackgroundAndNotify];
            }];
            
            [buildTask launch];
            
            [buildTask waitUntilExit];
        }
        @catch (NSException *exception) {
            NSLog(@"Problem Running Task: %@", [exception description]);
            isBuildSucess = NO;
            dispatch_sync(dispatch_get_main_queue(), ^{
                failure(exception);
            });
            
            
        }
        @finally {
            if (isBuildSucess) {
                dispatch_sync(dispatch_get_main_queue(), ^{
                    [self exportPlistForIPA:ipaName
                                 targetName:target
                                     inPath:exportPath
                                     domain:domain
                                    success:^{
                                        success();
                                    }
                                   progress:^(NSString *logs) {
                                       progress(logs);
                                   }
                                    failure:^(NSException *err) {
                                        failure(err);
                                    }];
                });
            }
        }
    });
    
}

@end
