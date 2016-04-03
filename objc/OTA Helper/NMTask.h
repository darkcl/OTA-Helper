#import <Cocoa/Cocoa.h>

@interface NMTask : NSTask

/** Stores the response from a successful task execution */
@property (strong) NSString *response;

/** Stores the error message from a failed task execution */
@property (strong) NSString *errorMessage;

/**
 * Runs any shell script and returns an instance of NMTask.
 *
 * Example:
 *
 *     NMTask *task = [NMTask runScript:@"ls -la"];
 *     NSLog(@"Response from task: %@", [task response]);
 *
 * @param script Any valid shell script
 * @returns Instance of NMTask
 */
+ (instancetype)runScript:(NSString *)script;


+ (instancetype)runScript:(NSString *)script withWorkingDirectory:(NSString *)url;

/**
 * Runs any normal NSTask and returns an instance of NMTask.
 *
 * @param launchPath Application to launch script (e.g. /bin/sh)
 * @param args Shell command arguments (e.g. -c)
 * @returns Instance of NMTask
 */
+ (instancetype)runTaskAtLaunchPath:(NSString *)launchPath
                      withArguments:(NSArray *)args;

@end
