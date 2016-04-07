//
//  IPABuild.h
//  IPABuddy
//
//  Created by Yeung Yiu Hung on 6/4/2016.
//  Copyright © 2016 darkcl. All rights reserved.
//

#import <Foundation/Foundation.h>

@interface IPABuild : NSObject

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
                     failure:(void(^)(NSException *err))failure;

+ (void)exportPlistForIPA:(NSString *)ipaName
               targetName:(NSString *)target
                   inPath:(NSString *)currentDirectoryPath
                   domain:(NSString *)domain
                  success:(void(^)(void))success
                 progress:(void(^)(NSString *logs))progress
                  failure:(void(^)(NSException *err))failure;
@end
