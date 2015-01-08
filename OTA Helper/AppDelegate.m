//
//  AppDelegate.m
//  OTA Helper
//
//  Created by Yeung Yiu Hung on 8/1/15.
//  Copyright (c) 2015 Yeung Yiu Hung. All rights reserved.
//

#import "AppDelegate.h"

#define SAVED_INFO @"saveInfo"

@interface AppDelegate ()
@property (weak) IBOutlet NSTextField *projectLabel;
@property (weak) IBOutlet NSTextField *exportPathLabel;
@property (weak) IBOutlet NSButton *exportButton;
@property (weak) IBOutlet NSTextField *certificateLabel;
@property (weak) IBOutlet NSTextField *domainTextField;

@property (weak) IBOutlet NSWindow *window;
@end

@implementation AppDelegate

- (void)applicationDidFinishLaunching:(NSNotification *)aNotification {
    // Insert code here to initialize your application
    NSUserDefaults *userDefault = [NSUserDefaults standardUserDefaults];
    if ([userDefault objectForKey:SAVED_INFO]) {
        NSDictionary *saveInfoDict = [userDefault objectForKey:SAVED_INFO];
        xcodeProjURL = saveInfoDict[@"project"];
        projectName = [[xcodeProjURL lastPathComponent] stringByReplacingOccurrencesOfString:@".xcodeproj" withString:@""];
        _projectLabel.stringValue = projectName;
        exportURL = saveInfoDict[@"export"];
        _exportPathLabel.stringValue = saveInfoDict[@"export"];
        _domainTextField.stringValue = saveInfoDict[@"domain"];
        _certificateLabel.stringValue = saveInfoDict[@"cert"];
    }
}

- (void)applicationWillTerminate:(NSNotification *)aNotification {
    // Insert code here to tear down your application
}

- (IBAction)selectProject:(id)sender {
    NSOpenPanel *panel = [[NSOpenPanel alloc] init];
    [panel setFloatingPanel:NO];
    [panel setCanChooseDirectories:NO];
    [panel setCanChooseFiles:YES];
    [panel setAllowsMultipleSelection:NO];
    [panel setAllowedFileTypes:[NSArray arrayWithObject:@"xcodeproj"]];
    NSInteger i = [panel runModal];
    if(i == NSModalResponseOK){
        xcodeProjURL = [[panel URL] path];
        NSLog(@"XCODE PROJ : %@", xcodeProjURL);
        
        projectName = [[xcodeProjURL lastPathComponent] stringByReplacingOccurrencesOfString:@".xcodeproj" withString:@""];
        [_projectLabel setStringValue:projectName];
    }
}

- (IBAction)chooseExportPath:(id)sender {
    NSOpenPanel *panel = [[NSOpenPanel alloc] init];
    [panel setFloatingPanel:NO];
    [panel setCanChooseDirectories:YES];
    [panel setCanChooseFiles:NO];
    [panel setAllowsMultipleSelection:NO];
    NSInteger i = [panel runModal];
    if(i == NSModalResponseOK){
        exportURL = [[panel URL] path];
        NSLog(@"EXPORT PATH : %@", exportURL);
        
        [_exportPathLabel setStringValue:exportURL];
    }
}

- (IBAction)exportIPA:(id)sender {
    if (projectName.length == 0 ||
        exportURL.length == 0 ||
        xcodeProjURL.length == 0||
        _certificateLabel.stringValue.length == 0 ||
        _domainTextField.stringValue.length == 0) {
        return;
    }else{
        NSMutableArray *arguments = [[NSMutableArray alloc] init];
        [arguments addObject:projectName];
        [arguments addObject:_certificateLabel.stringValue];
        [arguments addObject:[xcodeProjURL stringByDeletingLastPathComponent]];
        [arguments addObject:exportURL];
        
        NSDateFormatter *dateFormatter = [[NSDateFormatter alloc] init];
        [dateFormatter setLocale:[NSLocale currentLocale]];
        [dateFormatter setDateFormat: @"yyyyMMddHHmm"];
        NSDate *now = [NSDate date];
        dateString = [dateFormatter stringFromDate:now];
        [arguments addObject:dateString];
        
        NSDictionary *saveInfoDicr = @{@"project":xcodeProjURL,
                                       @"export":exportURL,
                                       @"cert":_certificateLabel.stringValue,
                                       @"domain":_domainTextField.stringValue};
        [[NSUserDefaults standardUserDefaults] setObject:saveInfoDicr forKey:SAVED_INFO];
        [[NSUserDefaults standardUserDefaults] synchronize];
        
        [self runScript:arguments];
    }
}

- (void)runScript:(NSArray*)arguments {
    
    dispatch_queue_t taskQueue = dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_BACKGROUND, 0);
    dispatch_async(taskQueue, ^{
        
        self.isRunning = YES;
        isBuildSucess = YES;
        _exportButton.enabled = NO;
        _exportButton.stringValue = @"Exporting IPA...";
        @try {
            
            NSString *path  = [NSString stringWithFormat:@"%@", [[NSBundle mainBundle] pathForResource:@"BuildScript" ofType:@"sh"]];
            
            NSTask *buildTask = [[NSTask alloc] init];
            buildTask.launchPath = path;
            buildTask.arguments  = arguments;
            
            [buildTask launch];
            
            [buildTask waitUntilExit];
        }
        @catch (NSException *exception) {
            NSLog(@"Problem Running Task: %@", [exception description]);
            isBuildSucess = NO;
        }
        @finally {
            [self.exportButton setEnabled:YES];
            self.isRunning = NO;
            
            if (isBuildSucess) {
                [self exportPlistForOTA];
            }
        }
    });
}

- (void)exportPlistForOTA{
    dispatch_queue_t taskQueue = dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_BACKGROUND, 0);
    dispatch_async(taskQueue, ^{
        
        self.isRunning = YES;
        isBuildSucess = YES;
        _exportButton.enabled = NO;
        _exportButton.stringValue = @"Exporting Plist...";
        @try {
            
            NSString *path  = [NSString stringWithFormat:@"%@", [[NSBundle mainBundle] pathForResource:@"otabuddy" ofType:@"sh"]];
            
            NSTask *buildTask = [[NSTask alloc] init];
            buildTask.launchPath = path;
            buildTask.currentDirectoryPath = exportURL;
            buildTask.arguments = @[@"plist",
                                    [NSString stringWithFormat:@"%@-%@.ipa",projectName,dateString],
                                    [NSString stringWithFormat:@"%@%@",_domainTextField.stringValue,[NSString stringWithFormat:@"%@-%@.ipa",projectName,dateString]],
                                    [NSString stringWithFormat:@"%@-%@.plist",projectName,dateString]];
            [buildTask launch];
            
            [buildTask waitUntilExit];
        }
        @catch (NSException *exception) {
            NSLog(@"Problem Running Task: %@", [exception description]);
            isBuildSucess = NO;
        }
        @finally {
            [self.exportButton setEnabled:YES];
            self.isRunning = NO;
            _exportButton.enabled = YES;
            if (isBuildSucess) {
                
            }
        }
    });
}

@end
