//
//  AppDelegate.m
//  OTA Helper
//
//  Created by Yeung Yiu Hung on 8/1/15.
//  Copyright (c) 2015 Yeung Yiu Hung. All rights reserved.
//

#import "AppDelegate.h"
#import "OTASettingViewController.h"
#define SAVED_INFO @"saveInfo"

@interface AppDelegate ()
@property (weak) IBOutlet NSTextField *projectLabel;
@property (weak) IBOutlet NSTextField *exportPathLabel;
@property (weak) IBOutlet NSButton *exportButton;
@property (weak) IBOutlet NSTextField *certificateLabel;
@property (weak) IBOutlet NSTextField *domainTextField;

@property (weak) IBOutlet NSTextField *ftpField;
@property (weak) IBOutlet NSTextField *ftpPathField;
@property (weak) IBOutlet NSTextField *userField;
@property (weak) IBOutlet NSSecureTextField *passwordField;
@property (weak) IBOutlet NSDrawer *myDrawer;
@property (unsafe_unretained) IBOutlet NSTextView *consoleLogs;
@property (weak) IBOutlet NSDrawer *statusDrawer;
@property (weak) IBOutlet NSTextField *ipaStatusLabel;
@property (weak) IBOutlet NSTextField *plistStatusLabel;
@property (weak) IBOutlet NSTextField *jsonStatusLabel;
@property (weak) IBOutlet NSView *progessView;
@property (weak) IBOutlet NSProgressIndicator *progressIndicator;

@property (weak) IBOutlet NSView *emailInfoView;
@property (weak) IBOutlet NSTextField *gmailTextField;
@property (weak) IBOutlet NSSecureTextField *gmailPasswordField;

@property (weak) IBOutlet NSTextField *toEmailField;
@property (weak) IBOutlet NSTextField *ccEmailField;
@property (unsafe_unretained) IBOutlet NSTextView *emailMessageTextView;
@property (weak) IBOutlet NSTextField *emailDisplayNameField;

@property (weak) IBOutlet NSWindow *projectsManagerWindow;
@property (weak) IBOutlet NSView *projectSettingView;

@property (weak) IBOutlet NSWindow *window;
@end

@implementation AppDelegate

- (void)applicationDidFinishLaunching:(NSNotification *)aNotification {
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
        
        _ftpPathField.stringValue = saveInfoDict[@"ftpPath"];
        _ftpField.stringValue = saveInfoDict[@"ftpDomain"];
        _userField.stringValue = saveInfoDict[@"ftpUser"];
        _passwordField.stringValue = saveInfoDict[@"ftpPassword"];
    }
    [_myDrawer setContentSize:NSMakeSize(300, _myDrawer.contentSize.height)];
    [_statusDrawer setContentSize:NSMakeSize(300, _statusDrawer.contentSize.height)];
    
    CALayer *viewLayer = [CALayer layer];
    [viewLayer setBackgroundColor:CGColorCreateGenericRGB(0.0, 0.0, 0.0, 0.4)]; //RGB plus Alpha Channel
    [_progessView setWantsLayer:YES]; // view's backing store is using a Core Animation Layer
    [_progessView setLayer:viewLayer];
    _progessView.hidden = YES;
    [_progressIndicator startAnimation:nil];
    //[self showEmail];
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
        now = [NSDate date];
        dateString = [dateFormatter stringFromDate:now];
        [arguments addObject:dateString];
        
        
//        _ftpPathField.stringValue = saveInfoDict[@"ftpPath"];
//        _ftpField.stringValue = saveInfoDict[@"ftpDomain"];
//        _userField.stringValue = saveInfoDict[@"ftpUser"];
//        _passwordField.stringValue = saveInfoDict[@"ftpPassword"];
        NSDictionary *saveInfoDicr = @{@"project":xcodeProjURL,
                                       @"export":exportURL,
                                       @"cert":_certificateLabel.stringValue,
                                       @"domain":_domainTextField.stringValue,
                                       
                                       @"ftpPath":_ftpPathField.stringValue,
                                       @"ftpDomain":_ftpField.stringValue,
                                       @"ftpUser":_userField.stringValue,
                                       @"ftpPassword":_passwordField.stringValue};
        [[NSUserDefaults standardUserDefaults] setObject:saveInfoDicr forKey:SAVED_INFO];
        [[NSUserDefaults standardUserDefaults] synchronize];
        
        [self runScript:arguments];
    }
}

- (void)runScript:(NSArray*)arguments {
    [_myDrawer open];
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
            
            // Output Handling
            NSPipe *outputPipe = [[NSPipe alloc] init];
            buildTask.standardOutput = outputPipe;
            
            [[outputPipe fileHandleForReading] waitForDataInBackgroundAndNotify];
            
            [[NSNotificationCenter defaultCenter] addObserverForName:NSFileHandleDataAvailableNotification object:[outputPipe fileHandleForReading] queue:nil usingBlock:^(NSNotification *notification){
                
                NSData *output = [[outputPipe fileHandleForReading] availableData];
                NSString *outStr = [[NSString alloc] initWithData:output encoding:NSUTF8StringEncoding];
                
                dispatch_sync(dispatch_get_main_queue(), ^{
                    _consoleLogs.string = [_consoleLogs.string stringByAppendingString:[NSString stringWithFormat:@"\n%@", outStr]];
                    // Scroll to end of outputText field
                    NSRange range;
                    range = NSMakeRange([_consoleLogs.string length], 0);
                    [_consoleLogs scrollRangeToVisible:range];
                });
                [[outputPipe fileHandleForReading] waitForDataInBackgroundAndNotify];
            }];
            
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
                NSLog(@"Git Commit Number");
                NMTask *task = [NMTask runScript:@"git log --pretty=format:'%h' -n 1" withWorkingDirectory:[xcodeProjURL stringByDeletingLastPathComponent]];
                NSLog(@"Response: %@", task.response);
                NSLog(@"Error: %@", task.errorMessage);
                
                //2014-12-30 (<a href="itms-services://?action=download-manifest&url=https://download.cherrypicks.com/StylishPark/Source/OTA/Stylistpark_20141230.plist">Commit 3fc3ddb20ca9</a>
                dispatch_async(dispatch_get_main_queue(), ^{
                    [_myDrawer close];
                    _progessView.hidden = NO;
                    NSPasteboard *generalPasteBoard = [NSPasteboard generalPasteboard];
                
                    [generalPasteBoard declareTypes:[NSArray arrayWithObject:NSPasteboardTypeString] owner:nil];
                    NSDateFormatter *dateFormatter = [[NSDateFormatter alloc] init];
                    [dateFormatter setLocale:[NSLocale currentLocale]];
                    [dateFormatter setDateFormat: @"yyyy-MM-dd HH:mm"];
                    NSString *htmlDateString = [dateFormatter stringFromDate:now];
                    
                    NSString *htmlString = [NSString stringWithFormat:@"%@ (<a href=\"itms-services://?action=download-manifest&url=%@\">Commit %@</a>)",htmlDateString,[NSString stringWithFormat:@"%@%@",_domainTextField.stringValue,[NSString stringWithFormat:@"%@-%@.plist",projectName,dateString]] ,task.response];
                    
                    qrString = [NSString stringWithFormat:@"itms-services://?action=download-manifest&url=%@",[NSString stringWithFormat:@"%@%@",_domainTextField.stringValue,[NSString stringWithFormat:@"%@-%@.plist",projectName,dateString]]];
                    [generalPasteBoard setString:htmlString forType:NSPasteboardTypeString];
                    NSAlert *alert = [NSAlert alertWithMessageText:@"Upload To SFTP?"
                                                     defaultButton:@"OK"
                                                   alternateButton:@"Cancel"
                                                       otherButton:nil
                                         informativeTextWithFormat:[NSString stringWithFormat:@"Copied %@ to Pasteboard",htmlString]];
                    
                    
                    if ([alert runModal] == NSAlertDefaultReturn) {
                        NMSSHSession *session = [NMSSHSession connectToHost:_ftpField.stringValue
                                                               withUsername:_userField.stringValue];
                        
                        if (session.isConnected) {
                            [session authenticateByPassword:_passwordField.stringValue];
                            if (session.isAuthorized) {
                                NSLog(@"Authentication succeeded");
                                //                        NSError *error = nil;
                                //                        NSString *response = [session.channel execute:[NSString stringWithFormat:@"ls -l %@", _ftpPathField.stringValue] error:&error];
                                //                        NSLog(@"List : %@", response);
                                NSString *ipaURL = [exportURL stringByAppendingPathComponent:[NSString stringWithFormat:@"%@-%@.ipa",projectName,dateString]];
                                NSString *plistURL = [exportURL stringByAppendingPathComponent:[NSString stringWithFormat:@"%@-%@.plist",projectName,dateString]];
                                
                                
                                
                                [session.channel uploadFile:ipaURL
                                                         to:_ftpPathField.stringValue];
                                
                                [session.channel uploadFile:plistURL
                                                         to:_ftpPathField.stringValue];
                                
                                NSString *resultJson = [exportURL stringByAppendingPathComponent:[NSString stringWithFormat:@"%@.json",projectName]];
                                
                                [session.channel downloadFile:[_ftpPathField.stringValue stringByAppendingPathComponent:[NSString stringWithFormat:@"%@.json",projectName]]
                                                           to:resultJson];
                                
                                if (![[NSFileManager defaultManager] fileExistsAtPath:resultJson]) {
                                    NSArray *links = @[htmlString];
                                    NSData *jsonData = [NSJSONSerialization dataWithJSONObject:links
                                                                                       options:NSJSONWritingPrettyPrinted // Pass 0 if you don't care about the readability of the generated string
                                                                                         error:nil];
                                    
                                    NSString *jsonString = [[NSString alloc] initWithData:jsonData encoding:NSUTF8StringEncoding];
                                    NSLog(@"%@",jsonString);
                                    
                                    [jsonString writeToFile:resultJson
                                                   atomically:YES
                                                     encoding:NSUTF8StringEncoding error:nil];
                                }else{
                                    NSString *jsonString = [[NSString alloc] initWithContentsOfFile:resultJson encoding:NSUTF8StringEncoding error:NULL];
                                    NSError *jsonError;
                                    NSMutableArray *links = [NSJSONSerialization JSONObjectWithData:[jsonString dataUsingEncoding:NSUTF8StringEncoding] options:NSJSONReadingMutableContainers error:&jsonError];
                                    
                                    [links addObject:htmlString];
                                    NSData *jsonData = [NSJSONSerialization dataWithJSONObject:links
                                                                                       options:NSJSONWritingPrettyPrinted // Pass 0 if you don't care about the readability of the generated string
                                                                                         error:nil];
                                    
                                    NSString *jsonExportString = [[NSString alloc] initWithData:jsonData encoding:NSUTF8StringEncoding];
                                    [jsonExportString writeToFile:resultJson
                                                       atomically:YES
                                                         encoding:NSUTF8StringEncoding error:nil];
                                }
                                
                                [session.channel uploadFile:resultJson
                                                         to:_ftpPathField.stringValue];
                            }
                        }
                        
                        _progessView.hidden = YES;
                        [session disconnect];
                        _emailMessageTextView.string = [NSString stringWithFormat:@"OTA Build For %@ is ready, attached QR for downloading Apps",_projectLabel.stringValue];
                        
                        [self showEmail];
                    }else{
                        _progessView.hidden = YES;
                    }
                });
                
                
            }
        }
    });
}

- (void)showEmail{
    NSAlert *alert = [[NSAlert alloc] init];
    [alert setAccessoryView:_emailInfoView];
    [alert addButtonWithTitle:@"OK"];
    [alert addButtonWithTitle:@"Cancel"];
    [alert setAlertStyle:NSInformationalAlertStyle];
    [alert setMessageText:@"Send Email?"];
    [alert beginSheetModalForWindow:_window modalDelegate:self didEndSelector:@selector(alertDidEnd:returnCode:contextInfo:) contextInfo:nil];
}

- (BOOL) validateEmail: (NSString *) candidate {
    NSString *emailRegex =
    @"(?:[a-z0-9!#$%\\&'*+/=?\\^_`{|}~-]+(?:\\.[a-z0-9!#$%\\&'*+/=?\\^_`{|}"
    @"~-]+)*|\"(?:[\\x01-\\x08\\x0b\\x0c\\x0e-\\x1f\\x21\\x23-\\x5b\\x5d-\\"
    @"x7f]|\\\\[\\x01-\\x09\\x0b\\x0c\\x0e-\\x7f])*\")@(?:(?:[a-z0-9](?:[a-"
    @"z0-9-]*[a-z0-9])?\\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\\[(?:(?:25[0-5"
    @"]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-"
    @"9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\\x01-\\x08\\x0b\\x0c\\x0e-\\x1f\\x21"
    @"-\\x5a\\x53-\\x7f]|\\\\[\\x01-\\x09\\x0b\\x0c\\x0e-\\x7f])+)\\])";
    NSPredicate *emailTest = [NSPredicate predicateWithFormat:@"SELF MATCHES[c] %@", emailRegex];
    
    return [emailTest evaluateWithObject:candidate];
}

- (void)alertDidEnd:(NSAlert *)alert returnCode:(NSInteger)returnCode contextInfo:(void *)contextInfo {
    if (returnCode == NSAlertFirstButtonReturn) {
        if (![self validateEmail:_gmailTextField.stringValue]) {
            return;
        }else{
            MCOSMTPSession *smtpSession = [[MCOSMTPSession alloc] init];
            smtpSession.hostname = @"smtp.gmail.com";
            smtpSession.port = 465;
            smtpSession.username = _gmailTextField.stringValue;
            smtpSession.password = _gmailPasswordField.stringValue;
            smtpSession.authType = MCOAuthTypeSASLPlain;
            smtpSession.connectionType = MCOConnectionTypeTLS;
            
            MCOMessageBuilder *builder = [[MCOMessageBuilder alloc] init];
            MCOAddress *from = [MCOAddress addressWithDisplayName:_emailDisplayNameField.stringValue
                                                          mailbox:_gmailTextField.stringValue];
            
            NSArray *toArray = [[_toEmailField.stringValue stringByReplacingOccurrencesOfString:@" " withString:@""] componentsSeparatedByString:@","];
            NSMutableArray *toEmailObjects = [[NSMutableArray alloc] init];
            for (NSString *emailStr in toArray) {
                if ([self validateEmail:emailStr]) {
                    MCOAddress *to = [MCOAddress addressWithDisplayName:nil
                                                                mailbox:emailStr];
                    [toEmailObjects addObject:to];
                }
            }
            
            NSArray *ccArray = [[_ccEmailField.stringValue stringByReplacingOccurrencesOfString:@" " withString:@""] componentsSeparatedByString:@","];
            NSMutableArray *ccEmailObjects = [[NSMutableArray alloc] init];
            for (NSString *emailStr in ccArray) {
                if ([self validateEmail:emailStr]) {
                    MCOAddress *cc = [MCOAddress addressWithDisplayName:nil
                                                                mailbox:emailStr];
                    [ccEmailObjects addObject:cc];
                }
            }
            NSData *qrData;
            NSError *error = nil;
            ZXMultiFormatWriter *writer = [ZXMultiFormatWriter writer];
            ZXBitMatrix* result = [writer encode:qrString
                                          format:kBarcodeFormatQRCode
                                           width:250
                                          height:250
                                           error:&error];
            if (result) {
                CGImageRef image = [[ZXImage imageWithMatrix:result] cgimage];
                NSImage *img = [[NSImage alloc] initWithCGImage:image size:NSMakeSize(250, 250)];
                qrData = [img TIFFRepresentation];
                // This CGImageRef image can be placed in a UIImage, NSImage, or written to a file.
            } else {
                NSString *errorMessage = [error localizedDescription];
                NSAlert *alert = [[NSAlert alloc] init];
                [alert setMessageText:@"Error"];
                [alert setInformativeText:errorMessage];
                [alert addButtonWithTitle:@"OK"];
                [alert runModal];
            }
            
            [[builder header] setFrom:from];
            [[builder header] setTo:toEmailObjects];
            [[builder header] setCc:ccEmailObjects];
            [[builder header] setSubject:[NSString stringWithFormat:@"[%@] OTA Build is ready", _projectLabel.stringValue]];
            [builder setHTMLBody:_emailMessageTextView.string];
            if (result) {
                [builder setAttachments:@[[MCOAttachment attachmentWithData:qrData filename:@"qr.png"]]];
            }
            
            NSData * rfc822Data = [builder data];
            
            MCOSMTPSendOperation *sendOperation =
            [smtpSession sendOperationWithData:rfc822Data];
            [sendOperation start:^(NSError *error) {
                if(error) {
                    NSLog(@"Error sending email: %@", error);
                } else {
                    NSLog(@"Successfully sent email!");
                }
            }];
        }
    }
}

@end
