//
//  OTAWindowController.m
//  OTA Helper
//
//  Created by Yeung Yiu Hung on 17/3/15.
//  Copyright (c) 2015 Yeung Yiu Hung. All rights reserved.
//

#import "OTAWindowController.h"

#import "Provisioning.h"

@interface OTAWindowController ()

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
    
@property (strong) IBOutlet NSPopUpButton *popupButton;
@property (strong) IBOutlet NSMenu *popupMenu;

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

@property (nonatomic, strong) NSMutableArray *provisioningArray;

@end

@implementation OTAWindowController

- (id)initWithIndicator:(NSString *)indicator{
    if (self = [super initWithWindowNibName:@"OTAWindowController" owner:self]) {
        indicatorStr = indicator;
        _provisioningArray = [[NSMutableArray alloc] init];
    }
    return self;
}

- (void)buildListIdentity {
    [self.popupMenu removeAllItems];
    NSString *library = [NSSearchPathForDirectoriesInDomains(NSLibraryDirectory, NSUserDomainMask, YES) firstObject];
    
    NSString *mobileProvisioningFolder = [library stringByAppendingPathComponent:@"MobileDevice/Provisioning Profiles"];
    NSFileManager *fm = [NSFileManager defaultManager];
    NSArray *contents = [fm contentsOfDirectoryAtPath:mobileProvisioningFolder error:nil];
    [self.provisioningArray removeAllObjects];
    
    for (NSString *name in contents) {
        if ([name hasPrefix:@"."]) continue;
        if ([name.pathExtension caseInsensitiveCompare:@"mobileprovision"] != NSOrderedSame) continue;
        
        NSString *path = [mobileProvisioningFolder stringByAppendingPathComponent:name];
        Provisioning *provisioning = [[Provisioning alloc] initWithPath:path];
        [self.provisioningArray addObject:provisioning];
    }
    [self.provisioningArray sortUsingDescriptors:@[[NSSortDescriptor sortDescriptorWithKey:@"name" ascending:YES selector:@selector(caseInsensitiveCompare:)]]];
    
    for (Provisioning *provision in self.provisioningArray) {
        //Ignore expired provisioning
        if (provision.isExpired)
            continue;
        
        NSMenuItem *item = [[NSMenuItem alloc] init];
        item.title = [NSString stringWithFormat:@"%@", provision.name];
        
        [item setEnabled:NO];
        [self.popupMenu addItem:item];
    }
    if (self.popupButton.numberOfItems > 0) {
        [self.popupButton selectItemAtIndex:1];
    }
}

- (void)lookupBestIdentity {
    
}

- (void)windowDidLoad {
    [super windowDidLoad];
    [self buildListIdentity];
    NSUserDefaults *userDefault = [NSUserDefaults standardUserDefaults];
    if ([[userDefault objectForKey:SAVED_INFO] objectForKey:indicatorStr]) {
        NSDictionary *saveInfoDict = [[userDefault objectForKey:SAVED_INFO] objectForKey:indicatorStr];
        xcodeProjURL = saveInfoDict[@"project"];
        projectName = [[xcodeProjURL lastPathComponent] stringByReplacingOccurrencesOfString:@".xcodeproj" withString:@""];
        _projectLabel.stringValue = projectName;
        exportURL = saveInfoDict[@"export"];
        _exportPathLabel.stringValue = saveInfoDict[@"export"];
        _domainTextField.stringValue = saveInfoDict[@"domain"];
        _certificateLabel.stringValue = saveInfoDict[@"cert"];
        for (NSString *itemTitle in _popupButton.itemTitles) {
            if ([itemTitle isEqualToString:saveInfoDict[@"cert"]]) {
                [_popupButton selectItemWithTitle:itemTitle];
            }
        }
        _ftpPathField.stringValue = saveInfoDict[@"ftpPath"];
        _ftpField.stringValue = saveInfoDict[@"ftpDomain"];
        _userField.stringValue = saveInfoDict[@"ftpUser"];
        _passwordField.stringValue = saveInfoDict[@"ftpPassword"];
    }else{
        NSMutableDictionary *savedProjects = [[NSMutableDictionary alloc] init];
        [userDefault setObject:savedProjects forKey:SAVED_INFO];
        
        NSDictionary *saveInfoDicr = [[NSDictionary alloc] init];
        [savedProjects setObject:saveInfoDicr forKey:indicatorStr];
        [[NSUserDefaults standardUserDefaults] setObject:savedProjects forKey:SAVED_INFO];
        [[NSUserDefaults standardUserDefaults] synchronize];
    }
    
    [_myDrawer setContentSize:NSMakeSize(300, _myDrawer.contentSize.height)];
    [_statusDrawer setContentSize:NSMakeSize(300, _statusDrawer.contentSize.height)];
    
    CALayer *viewLayer = [CALayer layer];
    [viewLayer setBackgroundColor:CGColorCreateGenericRGB(0.0, 0.0, 0.0, 0.4)]; //RGB plus Alpha Channel
    [_progessView setWantsLayer:YES]; // view's backing store is using a Core Animation Layer
    [_progessView setLayer:viewLayer];
    _progessView.hidden = YES;
    [_progressIndicator startAnimation:nil];
    // Implement this method to handle any initialization after your window controller's window has been loaded from its nib file.
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
    _certificateLabel.stringValue = _popupButton.selectedItem.title;
    
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
        [arguments addObject:[projectName stringByReplacingOccurrencesOfString:@" " withString:@"-"]];
        
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
        NSMutableDictionary *savedProjects = [[[NSUserDefaults standardUserDefaults] objectForKey:SAVED_INFO] mutableCopy];
        [savedProjects setObject:saveInfoDicr forKey:indicatorStr];
        [[NSUserDefaults standardUserDefaults] setObject:savedProjects forKey:SAVED_INFO];
        [[NSUserDefaults standardUserDefaults] synchronize];
        
        [self runScript:arguments];
    }
}

- (void)runScript:(NSArray*)arguments {
    [_myDrawer open];
    [_progessView setHidden:NO];
    _consoleLogs.string = @"";
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
                    _consoleLogs.string = [NSString stringWithFormat:@"\n%@", outStr];
                });
                [[outputPipe fileHandleForReading] waitForDataInBackgroundAndNotify];
            }];
            
            [buildTask launch];
            
            [buildTask waitUntilExit];
        }
        @catch (NSException *exception) {
            NSLog(@"Problem Running Task: %@", [exception description]);
            isBuildSucess = NO;
            [_progessView setHidden:YES];
        }
        @finally {
            [self.exportButton setEnabled:YES];
            self.isRunning = NO;
            [_progessView setHidden:YES];
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
                                    [NSString stringWithFormat:@"%@-%@.ipa",[projectName stringByReplacingOccurrencesOfString:@" " withString:@"-"],dateString],
                                    [NSString stringWithFormat:@"%@%@",_domainTextField.stringValue,[NSString stringWithFormat:@"%@-%@.ipa",[projectName stringByReplacingOccurrencesOfString:@" " withString:@"-"],dateString]],
                                    [NSString stringWithFormat:@"%@-%@.plist",[projectName stringByReplacingOccurrencesOfString:@" " withString:@"-"],dateString]];
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
                
                dispatch_async(dispatch_get_main_queue(), ^{
                    [_myDrawer close];
                    _progessView.hidden = NO;
                    NSPasteboard *generalPasteBoard = [NSPasteboard generalPasteboard];
                    
                    [generalPasteBoard declareTypes:[NSArray arrayWithObject:NSPasteboardTypeString] owner:nil];
                    NSDateFormatter *dateFormatter = [[NSDateFormatter alloc] init];
                    [dateFormatter setLocale:[NSLocale currentLocale]];
                    [dateFormatter setDateFormat: @"yyyy-MM-dd HH:mm"];
                    NSString *htmlDateString = [dateFormatter stringFromDate:now];
                    
                    NSString *htmlString = [NSString stringWithFormat:@"%@ (<a href=\"itms-services://?action=download-manifest&url=%@\">Commit %@</a>)",htmlDateString,[NSString stringWithFormat:@"%@%@",_domainTextField.stringValue,[NSString stringWithFormat:@"%@-%@.plist",[projectName stringByReplacingOccurrencesOfString:@" " withString:@"-"],dateString]] ,task.response];
                    
                    qrString = [NSString stringWithFormat:@"itms-services://?action=download-manifest&url=%@",[NSString stringWithFormat:@"%@%@",_domainTextField.stringValue,[NSString stringWithFormat:@"%@-%@.plist",[projectName stringByReplacingOccurrencesOfString:@" " withString:@"-"],dateString]]];
                    [generalPasteBoard setString:htmlString forType:NSPasteboardTypeString];
                    NSAlert *alert = [NSAlert alertWithMessageText:@"Upload To SFTP?"
                                                     defaultButton:@"OK"
                                                   alternateButton:@"Cancel"
                                                       otherButton:nil
                                         informativeTextWithFormat:@"Copied %@ to Pasteboard",htmlString];
                    
                    
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
                                NSString *ipaURL = [exportURL stringByAppendingPathComponent:[NSString stringWithFormat:@"%@-%@.ipa",[projectName stringByReplacingOccurrencesOfString:@" " withString:@"-"],dateString]];
                                NSString *plistURL = [exportURL stringByAppendingPathComponent:[NSString stringWithFormat:@"%@-%@.plist",[projectName stringByReplacingOccurrencesOfString:@" " withString:@"-"],dateString]];
                                
                                
                                
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
                                    
                                    [links insertObject:htmlString atIndex:0];
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
                        _emailMessageTextView.string = [NSString stringWithFormat:@"<html>OTA Build For %@ (Commit %@) is ready. <p>Attached QR for downloading the app or download here :%@index.html </p></html>",_projectLabel.stringValue, task.response, _domainTextField.stringValue];
                        
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
    [alert beginSheetModalForWindow:self.window modalDelegate:self didEndSelector:@selector(alertDidEnd:returnCode:contextInfo:) contextInfo:nil];
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
