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
            [_recentProjects.submenu addItem:[[NSMenuItem alloc] initWithTitle:str action:@selector(projectSelected:) keyEquivalent:@""]];
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
        OTAWindowController *aWindow = [[OTAWindowController alloc] initWithIndicator:_projectName.stringValue];
        [aWindow showWindow:nil];
        [projectWindows addObject:aWindow];
    }
}

- (void)projectSelected:(id)sender{
    NSMenuItem *anItem = (NSMenuItem *)sender;
    OTAWindowController *aWindow = [[OTAWindowController alloc] initWithIndicator:anItem.title];
    [aWindow showWindow:nil];
    [projectWindows addObject:aWindow];
}

@end
