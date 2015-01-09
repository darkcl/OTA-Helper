#import "NMTask.h"

@implementation NMTask

+ (instancetype)runScript:(NSString *)script {
    return [self runTaskAtLaunchPath:@"/bin/sh" withArguments:@[@"-c", script]];
}

+ (instancetype)runScript:(NSString *)script withWorkingDirectory:(NSString *)url{
    NSTask *task = [NSTask new];
    [task setLaunchPath:@"/bin/sh"];
    [task setArguments:@[@"-c", script]];
    [task setCurrentDirectoryPath:url];
    
    // Set standard input, output and error
    NSPipe *responsePipe = [NSPipe pipe];
    NSPipe *errorPipe = [NSPipe pipe];
    [task setStandardInput:[NSPipe pipe]];
    [task setStandardOutput:responsePipe];
    [task setStandardError:errorPipe];
    [task launch];
    
    NMTask *taskWrapper = [NMTask new];
    
    // Set output responses
    [taskWrapper setResponse:[[NSString alloc] initWithData:[responsePipe.fileHandleForReading readDataToEndOfFile]
                                                   encoding:NSUTF8StringEncoding]];
    [taskWrapper setErrorMessage:[[NSString alloc] initWithData:[errorPipe.fileHandleForReading readDataToEndOfFile]
                                                       encoding:NSUTF8StringEncoding]];
    
    return taskWrapper;
}

+ (instancetype)runTaskAtLaunchPath:(NSString *)launchPath withArguments:(NSArray *)args {
    NSTask *task = [NSTask new];
    [task setLaunchPath:launchPath];
    [task setArguments:args];

    // Set standard input, output and error
    NSPipe *responsePipe = [NSPipe pipe];
    NSPipe *errorPipe = [NSPipe pipe];
    [task setStandardInput:[NSPipe pipe]];
    [task setStandardOutput:responsePipe];
    [task setStandardError:errorPipe];
    [task launch];

    NMTask *taskWrapper = [NMTask new];

    // Set output responses
    [taskWrapper setResponse:[[NSString alloc] initWithData:[responsePipe.fileHandleForReading readDataToEndOfFile]
                                                   encoding:NSUTF8StringEncoding]];
    [taskWrapper setErrorMessage:[[NSString alloc] initWithData:[errorPipe.fileHandleForReading readDataToEndOfFile]
                                                       encoding:NSUTF8StringEncoding]];

    return taskWrapper;
}

@end
