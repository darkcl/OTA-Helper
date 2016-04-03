#!/bin/sh

#  BuildScript.sh
#  OTA Helper
#
#  Created by Yeung Yiu Hung on 8/1/15.
#  Copyright (c) 2015 Yeung Yiu Hung. All rights reserved.

appname="${1}"
target_name="$appname"
sdk="iphoneos"
provision="${2}"
project_dir="${3}"
build_location="${4}"
NOW="${5}"
ipaname="${6}"
workspace="${7}"
if [ ! -d "$build_location" ]; then
    mkdir -p "$build_location"
fi

cd "$project_dir"

xcodebuild -configuration Release -scheme "$appname" -destination generic/platform=iOS  -workspace "$workspace" clean archive -archivePath "$build_location/App-$NOW"
xcodebuild -configuration Release -exportArchive -exportFormat ipa -archivePath "$build_location/App-$NOW.xcarchive" -exportPath "$build_location/$ipaname-$NOW.ipa" -exportProvisioningProfile "$provision"

#echo "gym -s $appname -o $build_location -n $ipaname-$NOW -i $provision"

#xcodebuild -target "$appname" OBJROOT="$build_location/obj.root" SYMROOT="$build_location/sym.root"
#xcodebuild -configuration Release -exportArchive -exportFormat ipa -archivePath "build/App.xcarchive" -exportPath "build/App.ipa" -exportProvisioningProfile "PROVISIONING_PROFILE_NAME"
#xcrun -sdk iphoneos PackageApplication -v "$build_location/sym.root/Release-iphoneos/$appname.app" -exportProvisioningProfile "PROVISIONING_PROFILE_NAME"

#echo "*********************************"
#echo "Build Started"
#echo "*********************************"
#
#echo "*********************************"
#echo "Beginning Build Process"
#echo "*********************************"
#xcodebuild -project "${1}" -target "${2}" -sdk iphoneos -verbose
#
#echo "*********************************"
#echo "Creating IPA"
#echo "*********************************"
#/usr/bin/xcrun -verbose -sdk iphoneos PackageApplication -v "${3}/${4}.app" -o "${5}/app.ipa"