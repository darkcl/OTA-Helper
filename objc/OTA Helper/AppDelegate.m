//
//  AppDelegate.m
//  OTA Helper
//
//  Created by Yeung Yiu Hung on 8/1/15.
//  Copyright (c) 2015 Yeung Yiu Hung. All rights reserved.
//

#import "AppDelegate.h"
#import "OTAWindowController.h"

@interface AppDelegate ()

@property (weak) IBOutlet NSView *inputProjectName;
@property (weak) IBOutlet SUUpdater *updater;
@property (weak) IBOutlet NSMenu *allProjects;

@property (weak) IBOutlet NSMenuItem *recentProjects;
@property (weak) IBOutlet NSTextField *projectName;
@end

@implementation AppDelegate

- (void)applicationDidFinishLaunching:(NSNotification *)aNotification {
    // Insert code here to initialize your application
    projectWindows = [[NSMutableArray alloc] init];
    //[self showEmail];
    if ([[NSUserDefaults standardUserDefaults] objectForKey:SAVED_INFO]){
        NSDictionary *aDict = [[NSUserDefaults standardUserDefaults] objectForKey:SAVED_INFO];
        
        for (NSString *str in [aDict allKeys]) {
            NSLog(@"Added %@", str);
            NSMenuItem *anItem = [_allProjects addItemWithTitle:str action:@selector(projectSelected:) keyEquivalent:@""];
            [anItem setTarget:self];
            
        }
    }else{
        [self createNewProject:nil];
    }
}

- (void)applicationWillTerminate:(NSNotification *)aNotification {
    // Insert code here to tear down your application
}

- (IBAction)createNewProject:(id)sender {
    NSAlert *a = [[NSAlert alloc] init];
    a.messageText = @"Create Project";
    a.accessoryView = _inputProjectName;
    NSInteger i = [a runModal];
    if (i == NSAlertAlternateReturn) {
        
        if ([[NSUserDefaults standardUserDefaults] objectForKey:SAVED_INFO]){
            NSDictionary *infoDict = [[NSUserDefaults standardUserDefaults] objectForKey:SAVED_INFO];
            NSMutableDictionary *userDefault = [[NSMutableDictionary alloc] initWithDictionary:infoDict];
            NSDictionary *aDict = [NSDictionary dictionary];
            
            [userDefault setObject:aDict forKey:_projectName.stringValue];
            [[NSUserDefaults standardUserDefaults] setObject:userDefault forKey:SAVED_INFO];
            [[NSUserDefaults standardUserDefaults] synchronize];
            
            [_allProjects removeAllItems];
            for (NSString *str in [userDefault allKeys]) {
                NSLog(@"Added %@", str);
                [_allProjects addItem:[[NSMenuItem alloc] initWithTitle:str action:@selector(projectSelected:) keyEquivalent:@""]];
            }
            
            OTAWindowController *aWindow = [[OTAWindowController alloc] initWithIndicator:_projectName.stringValue];
            [aWindow showWindow:nil];
            [projectWindows addObject:aWindow];
        }else{
            NSDictionary *infoDict = [[NSDictionary alloc] init];
            NSMutableDictionary *userDefault = [[NSMutableDictionary alloc] initWithDictionary:infoDict];
            NSDictionary *aDict = [NSDictionary dictionary];
            
            [userDefault setObject:aDict forKey:_projectName.stringValue];
            [[NSUserDefaults standardUserDefaults] setObject:userDefault forKey:SAVED_INFO];
            [[NSUserDefaults standardUserDefaults] synchronize];
            
            [_allProjects removeAllItems];
            for (NSString *str in [userDefault allKeys]) {
                NSLog(@"Added %@", str);
                [_allProjects addItem:[[NSMenuItem alloc] initWithTitle:str action:@selector(projectSelected:) keyEquivalent:@""]];
            }
            
            OTAWindowController *aWindow = [[OTAWindowController alloc] initWithIndicator:_projectName.stringValue];
            [aWindow showWindow:nil];
            [projectWindows addObject:aWindow];
        }
    }
}

- (void)projectSelected:(id)sender{
    NSMenuItem *anItem = (NSMenuItem *)sender;
    OTAWindowController *aWindow = [[OTAWindowController alloc] initWithIndicator:anItem.title];
    [aWindow showWindow:nil];
    [projectWindows addObject:aWindow];
}

@end
