# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Add any project specific keep options here:

# react-native-alipay start
-keep class com.alipay.** { *; }
# react-native-alipay end

# Hermes新增  Also, if you're using ProGuard, you will need to add these rules
# keep class com.facebook.hermes.unicode.** { *; }
# keep class com.facebook.jni.** { *; }

# react-native-amap3d start
# 3D 地图 V5.0.0之前：
-keep   class com.amap.api.maps.**{*;}
-keep   class com.autonavi.amap.mapcore.*{*;}
-keep   class com.amap.api.trace.**{*;}

# 3D 地图 V5.0.0之后：
-keep   class com.amap.api.maps.**{*;}
-keep   class com.autonavi.**{*;}
-keep   class com.amap.api.trace.**{*;}

# 定位
-keep class com.amap.api.location.**{*;}
-keep class com.amap.api.fence.**{*;}
-keep class com.autonavi.aps.amapapi.model.**{*;}

# 搜索
-keep   class com.amap.api.services.**{*;}

# 2D地图
-keep class com.amap.api.maps2d.**{*;}
-keep class com.amap.api.mapcore2d.**{*;}

# 导航
-keep class com.amap.api.navi.**{*;}
-keep class com.autonavi.**{*;}
# react-native-amap3d end

# react-native-wechat-lib start
-keep class com.tencent.mm.opensdk.** {*;}

-keep class com.tencent.wxop.** {*;}

-keep class com.tencent.mm.sdk.** {*;}
# react-native-wechat-lib end

# 云闪付 start
-dontwarn com.unionPay.**
-keep class com.unionPay.** {*;}
-keep class org.simalliance.openmobileapi.** {*;}
# 云闪付 end
