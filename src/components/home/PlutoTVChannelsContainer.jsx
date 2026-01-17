import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tv, Play, X } from "lucide-react";

const PLUTO_TV_CHANNELS = [
  { id: "andromeda-it", name: "Andromeda", genre: "sci-fi", streamUrl: "https://stitcher-ipv4.pluto.tv/v1/stitch/embed/hls/channel/60802d37ee238e0007c94e64/master.m3u8?advertisingId={PSID}&appVersion=unknown&deviceDNT={TARGETOPT}&deviceId={PSID}&deviceLat=0&deviceLon=0&deviceMake=samsung&deviceModel=samsung&deviceType=samsung-tvplus&deviceVersion=unknown&embedPartner=samsung-tvplus&profileFloor=&profileLimit=&samsung_app_domain={APP_DOMAIN}&samsung_app_name={APP_NAME}&us_privacy=1YNY" },
  { id: "avatar-it", name: "Avatar La Leggenda di Aang", genre: "action", streamUrl: "https://stitcher-ipv4.pluto.tv/v1/stitch/embed/hls/channel/624da1cd2af90c0007c13205/master.m3u8?advertisingId={PSID}&appVersion=unknown&deviceDNT={TARGETOPT}&deviceId={PSID}&deviceLat=0&deviceLon=0&deviceMake=samsung&deviceModel=samsung&deviceType=samsung-tvplus&deviceVersion=unknown&embedPartner=samsung-tvplus&profileFloor=&profileLimit=&samsung_app_domain={APP_DOMAIN}&samsung_app_name={APP_NAME}&us_privacy=1YNY" },
  { id: "catfish-it", name: "Catfish TV Show", genre: "reality", streamUrl: "https://stitcher-ipv4.pluto.tv/v1/stitch/embed/hls/channel/6093f9ed2c75660007322bb7/master.m3u8?advertisingId={PSID}&appVersion=unknown&deviceDNT={TARGETOPT}&deviceId={PSID}&deviceLat=0&deviceLon=0&deviceMake=samsung&deviceModel=samsung&deviceType=samsung-tvplus&deviceVersion=unknown&embedPartner=samsung-tvplus&profileFloor=&profileLimit=&samsung_app_domain={APP_DOMAIN}&samsung_app_name={APP_NAME}&us_privacy=1YNY" },
  { id: "clubbing-it", name: "Clubbing TV", genre: "music", streamUrl: "https://stitcher-ipv4.pluto.tv/v1/stitch/embed/hls/channel/60802de3fd2d70000763bb83/master.m3u8?advertisingId={PSID}&appVersion=unknown&deviceDNT={TARGETOPT}&deviceId={PSID}&deviceLat=0&deviceLon=0&deviceMake=samsung&deviceModel=samsung&deviceType=samsung-tvplus&deviceVersion=unknown&embedPartner=samsung-tvplus&profileFloor=&profileLimit=&samsung_app_domain={APP_DOMAIN}&samsung_app_name={APP_NAME}&us_privacy=1YNY" },
  { id: "consulenze-it", name: "Consulenze Illegali", genre: "drama", streamUrl: "https://stitcher-ipv4.pluto.tv/v1/stitch/embed/hls/channel/60b9dc99521a1400079bdfba/master.m3u8?advertisingId={PSID}&appVersion=unknown&deviceDNT={TARGETOPT}&deviceId={PSID}&deviceLat=0&deviceLon=0&deviceMake=samsung&deviceModel=samsung&deviceType=samsung-tvplus&deviceVersion=unknown&embedPartner=samsung-tvplus&profileFloor=&profileLimit=&samsung_app_domain={APP_DOMAIN}&samsung_app_name={APP_NAME}&us_privacy=1YNY" },
  { id: "doctor-who-it", name: "Doctor Who", genre: "sci-fi", streamUrl: "https://stitcher-ipv4.pluto.tv/v1/stitch/embed/hls/channel/62e7f8db27ce19000732d1aa/master.m3u8?advertisingId={PSID}&appVersion=unknown&deviceDNT={TARGETOPT}&deviceId={PSID}&deviceLat=0&deviceLon=0&deviceMake=samsung&deviceModel=samsung&deviceType=samsung-tvplus&deviceVersion=unknown&embedPartner=samsung-tvplus&profileFloor=&profileLimit=&samsung_app_domain={APP_DOMAIN}&samsung_app_name={APP_NAME}&us_privacy=1YNY" },
  { id: "due-fantagenitori-it", name: "Due Fantagenitori", genre: "comedy", streamUrl: "https://stitcher-ipv4.pluto.tv/v1/stitch/embed/hls/channel/62b57a6752a0060008bc65cd/master.m3u8?advertisingId={PSID}&appVersion=unknown&deviceDNT={TARGETOPT}&deviceId={PSID}&deviceLat=0&deviceLon=0&deviceMake=samsung&deviceModel=samsung&deviceType=samsung-tvplus&deviceVersion=unknown&embedPartner=samsung-tvplus&profileFloor=&profileLimit=&samsung_app_domain={APP_DOMAIN}&samsung_app_name={APP_NAME}&us_privacy=1YNY" },
  { id: "ex-on-beach-it", name: "Ex On The Beach", genre: "reality", streamUrl: "https://stitcher-ipv4.pluto.tv/v1/stitch/embed/hls/channel/60940ebad67fd900072382db/master.m3u8?advertisingId={PSID}&appVersion=unknown&deviceDNT={TARGETOPT}&deviceId={PSID}&deviceLat=0&deviceLon=0&deviceMake=samsung&deviceModel=samsung&deviceType=samsung-tvplus&deviceVersion=unknown&embedPartner=samsung-tvplus&profileFloor=&profileLimit=&samsung_app_domain={APP_DOMAIN}&samsung_app_name={APP_NAME}&us_privacy=1YNY" },
  { id: "fail-army-it", name: "FailArmy", genre: "comedy", streamUrl: "https://stitcher-ipv4.pluto.tv/v1/stitch/embed/hls/channel/608014d19a26320007c92ab6/master.m3u8?advertisingId={PSID}&appVersion=unknown&deviceDNT={TARGETOPT}&deviceId={PSID}&deviceLat=0&deviceLon=0&deviceMake=samsung&deviceModel=samsung&deviceType=samsung-tvplus&deviceVersion=unknown&embedPartner=samsung-tvplus&profileFloor=&profileLimit=&samsung_app_domain={APP_DOMAIN}&samsung_app_name={APP_NAME}&us_privacy=1YNY" },
  { id: "geordie-shore-it", name: "Geordie Shore", genre: "reality", streamUrl: "https://stitcher-ipv4.pluto.tv/v1/stitch/embed/hls/channel/619263ee9541940007d20d60/master.m3u8?advertisingId={PSID}&appVersion=unknown&deviceDNT={TARGETOPT}&deviceId={PSID}&deviceLat=0&deviceLon=0&deviceMake=samsung&deviceModel=samsung&deviceType=samsung-tvplus&deviceVersion=unknown&embedPartner=samsung-tvplus&profileFloor=&profileLimit=&samsung_app_domain={APP_DOMAIN}&samsung_app_name={APP_NAME}&us_privacy=1YNY" },
  { id: "ign-it", name: "IGN", genre: "gaming", streamUrl: "https://stitcher-ipv4.pluto.tv/v1/stitch/embed/hls/channel/608015ea48a6e800076f0f2f/master.m3u8?advertisingId={PSID}&appVersion=unknown&deviceDNT={TARGETOPT}&deviceId={PSID}&deviceLat=0&deviceLon=0&deviceMake=samsung&deviceModel=samsung&deviceType=samsung-tvplus&deviceVersion=unknown&embedPartner=samsung-tvplus&profileFloor=&profileLimit=&samsung_app_domain={APP_DOMAIN}&samsung_app_name={APP_NAME}&us_privacy=1YNY" },
  { id: "just-laughs-it", name: "Just for Laughs", genre: "comedy", streamUrl: "https://stitcher-ipv4.pluto.tv/v1/stitch/embed/hls/channel/6093f48c95132a00075fd859/master.m3u8?advertisingId={PSID}&appVersion=unknown&deviceDNT={TARGETOPT}&deviceId={PSID}&deviceLat=0&deviceLon=0&deviceMake=samsung&deviceModel=samsung&deviceType=samsung-tvplus&deviceVersion=unknown&embedPartner=samsung-tvplus&profileFloor=&profileLimit=&samsung_app_domain={APP_DOMAIN}&samsung_app_name={APP_NAME}&us_privacy=1YNY" },
  { id: "macgyver-it", name: "MacGyver", genre: "action", streamUrl: "https://stitcher-ipv4.pluto.tv/v1/stitch/embed/hls/channel/6245d4511358320007029cdf/master.m3u8?advertisingId={PSID}&appVersion=unknown&deviceDNT={TARGETOPT}&deviceId={PSID}&deviceLat=0&deviceLon=0&deviceMake=samsung&deviceModel=samsung&deviceType=samsung-tvplus&deviceVersion=unknown&embedPartner=samsung-tvplus&profileFloor=&profileLimit=&samsung_app_domain={APP_DOMAIN}&samsung_app_name={APP_NAME}&us_privacy=1YNY" },
  { id: "mutant-x-it", name: "Mutant X", genre: "sci-fi", streamUrl: "https://stitcher-ipv4.pluto.tv/v1/stitch/embed/hls/channel/60802c209a26320007c92ad5/master.m3u8?advertisingId={PSID}&appVersion=unknown&deviceDNT={TARGETOPT}&deviceId={PSID}&deviceLat=0&deviceLon=0&deviceMake=samsung&deviceModel=samsung&deviceType=samsung-tvplus&deviceVersion=unknown&embedPartner=samsung-tvplus&profileFloor=&profileLimit=&samsung_app_domain={APP_DOMAIN}&samsung_app_name={APP_NAME}&us_privacy=1YNY" },
  { id: "pluto-anime-it", name: "Pluto TV Anime", genre: "anime", streamUrl: "https://stitcher-ipv4.pluto.tv/v1/stitch/embed/hls/channel/612375086abc84000738fc03/master.m3u8?advertisingId={PSID}&appVersion=unknown&deviceDNT={TARGETOPT}&deviceId={PSID}&deviceLat=0&deviceLon=0&deviceMake=samsung&deviceModel=samsung&deviceType=samsung-tvplus&deviceVersion=unknown&embedPartner=samsung-tvplus&profileFloor=&profileLimit=&samsung_app_domain={APP_DOMAIN}&samsung_app_name={APP_NAME}&us_privacy=1YNY" },
  { id: "pluto-cinema-it", name: "Pluto TV Cinema Italiano", genre: "drama", streamUrl: "https://stitcher-ipv4.pluto.tv/v1/stitch/embed/hls/channel/608aa7d8359b270007861489/master.m3u8?advertisingId={PSID}&appVersion=unknown&deviceDNT={TARGETOPT}&deviceId={PSID}&deviceLat=0&deviceLon=0&deviceMake=samsung&deviceModel=samsung&deviceType=samsung-tvplus&deviceVersion=unknown&embedPartner=samsung-tvplus&profileFloor=&profileLimit=&samsung_app_domain={APP_DOMAIN}&samsung_app_name={APP_NAME}&us_privacy=1YNY" },
  { id: "pluto-crime-it", name: "Pluto TV Crime", genre: "thriller", streamUrl: "https://stitcher-ipv4.pluto.tv/v1/stitch/embed/hls/channel/608aa777b907770007e5d05d/master.m3u8?advertisingId={PSID}&appVersion=unknown&deviceDNT={TARGETOPT}&deviceId={PSID}&deviceLat=0&deviceLon=0&deviceMake=samsung&deviceModel=samsung&deviceType=samsung-tvplus&deviceVersion=unknown&embedPartner=samsung-tvplus&profileFloor=&profileLimit=&samsung_app_domain={APP_DOMAIN}&samsung_app_name={APP_NAME}&us_privacy=1YNY" },
  { id: "pluto-cucina-it", name: "Pluto TV Cucina", genre: "lifestyle", streamUrl: "https://stitcher-ipv4.pluto.tv/v1/stitch/embed/hls/channel/6261868633a2890007e87885/master.m3u8?advertisingId={PSID}&appVersion=unknown&deviceDNT={TARGETOPT}&deviceId={PSID}&deviceLat=0&deviceLon=0&deviceMake=samsung&deviceModel=samsung&deviceType=samsung-tvplus&deviceVersion=unknown&embedPartner=samsung-tvplus&profileFloor=&profileLimit=&samsung_app_domain={APP_DOMAIN}&samsung_app_name={APP_NAME}&us_privacy=1YNY" },
  { id: "pluto-documentari-it", name: "Pluto TV Documentary", genre: "documentary", streamUrl: "https://stitcher-ipv4.pluto.tv/v1/stitch/embed/hls/channel/608aa8a5709d6b0007b132fe/master.m3u8?advertisingId={PSID}&appVersion=unknown&deviceDNT={TARGETOPT}&deviceId={PSID}&deviceLat=0&deviceLon=0&deviceMake=samsung&deviceModel=samsung&deviceType=samsung-tvplus&deviceVersion=unknown&embedPartner=samsung-tvplus&profileFloor=&profileLimit=&samsung_app_domain={APP_DOMAIN}&samsung_app_name={APP_NAME}&us_privacy=1YNY" },
  { id: "pluto-family-it", name: "Pluto TV Family", genre: "family", streamUrl: "https://stitcher-ipv4.pluto.tv/v1/stitch/embed/hls/channel/6123742451cce0000789fc7a/master.m3u8?advertisingId={PSID}&appVersion=unknown&deviceDNT={TARGETOPT}&deviceId={PSID}&deviceLat=0&deviceLon=0&deviceMake=samsung&deviceModel=samsung&deviceType=samsung-tvplus&deviceVersion=unknown&embedPartner=samsung-tvplus&profileFloor=&profileLimit=&samsung_app_domain={APP_DOMAIN}&samsung_app_name={APP_NAME}&us_privacy=1YNY" },
  { id: "pluto-film-azione-it", name: "Pluto TV Film Azione", genre: "action", streamUrl: "https://stitcher-ipv4.pluto.tv/v1/stitch/embed/hls/channel/608aa17fb9f4490007e6419a/master.m3u8?advertisingId={PSID}&appVersion=unknown&deviceDNT={TARGETOPT}&deviceId={PSID}&deviceLat=0&deviceLon=0&deviceMake=samsung&deviceModel=samsung&deviceType=samsung-tvplus&deviceVersion=unknown&embedPartner=samsung-tvplus&profileFloor=&profileLimit=&samsung_app_domain={APP_DOMAIN}&samsung_app_name={APP_NAME}&us_privacy=1YNY" },
  { id: "pluto-film-classici-it", name: "Pluto TV Film Classici", genre: "classic", streamUrl: "https://stitcher-ipv4.pluto.tv/v1/stitch/embed/hls/channel/608aa3c446d73500075f0e24/master.m3u8?advertisingId={PSID}&appVersion=unknown&deviceDNT={TARGETOPT}&deviceId={PSID}&deviceLat=0&deviceLon=0&deviceMake=samsung&deviceModel=samsung&deviceType=samsung-tvplus&deviceVersion=unknown&embedPartner=samsung-tvplus&profileFloor=&profileLimit=&samsung_app_domain={APP_DOMAIN}&samsung_app_name={APP_NAME}&us_privacy=1YNY" },
  { id: "pluto-film-commedia-it", name: "Pluto TV Film Commedia", genre: "comedy", streamUrl: "https://stitcher-ipv4.pluto.tv/v1/stitch/embed/hls/channel/608aa512d67fd900072323db/master.m3u8?advertisingId={PSID}&appVersion=unknown&deviceDNT={TARGETOPT}&deviceId={PSID}&deviceLat=0&deviceLon=0&deviceMake=samsung&deviceModel=samsung&deviceType=samsung-tvplus&deviceVersion=unknown&embedPartner=samsung-tvplus&profileFloor=&profileLimit=&samsung_app_domain={APP_DOMAIN}&samsung_app_name={APP_NAME}&us_privacy=1YNY" },
  { id: "pluto-film-drama-it", name: "Pluto TV Film Drama", genre: "drama", streamUrl: "https://stitcher-ipv4.pluto.tv/v1/stitch/embed/hls/channel/608aa42b5c2b8f0007197529/master.m3u8?advertisingId={PSID}&appVersion=unknown&deviceDNT={TARGETOPT}&deviceId={PSID}&deviceLat=0&deviceLon=0&deviceMake=samsung&deviceModel=samsung&deviceType=samsung-tvplus&deviceVersion=unknown&embedPartner=samsung-tvplus&profileFloor=&profileLimit=&samsung_app_domain={APP_DOMAIN}&samsung_app_name={APP_NAME}&us_privacy=1YNY" },
  { id: "pluto-film-it", name: "Pluto TV Film", genre: "movies", streamUrl: "https://stitcher-ipv4.pluto.tv/v1/stitch/embed/hls/channel/608aa20a2e7f270007c4878d/master.m3u8?advertisingId={PSID}&appVersion=unknown&deviceDNT={TARGETOPT}&deviceId={PSID}&deviceLat=0&deviceLon=0&deviceMake=samsung&deviceModel=samsung&deviceType=samsung-tvplus&deviceVersion=unknown&embedPartner=samsung-tvplus&profileFloor=&profileLimit=&samsung_app_domain={APP_DOMAIN}&samsung_app_name={APP_NAME}&us_privacy=1YNY" },
  { id: "pluto-film-romantici-it", name: "Pluto TV Film Romantici", genre: "romance", streamUrl: "https://stitcher-ipv4.pluto.tv/v1/stitch/embed/hls/channel/608aa4a4cc92820007b663af/master.m3u8?advertisingId={PSID}&appVersion=unknown&deviceDNT={TARGETOPT}&deviceId={PSID}&deviceLat=0&deviceLon=0&deviceMake=samsung&deviceModel=samsung&deviceType=samsung-tvplus&deviceVersion=unknown&embedPartner=samsung-tvplus&profileFloor=&profileLimit=&samsung_app_domain={APP_DOMAIN}&samsung_app_name={APP_NAME}&us_privacy=1YNY" },
  { id: "pluto-film-thriller-it", name: "Pluto TV Film Thriller", genre: "thriller", streamUrl: "https://stitcher-ipv4.pluto.tv/v1/stitch/embed/hls/channel/608aa5e995132a00075f7005/master.m3u8?advertisingId={PSID}&appVersion=unknown&deviceDNT={TARGETOPT}&deviceId={PSID}&deviceLat=0&deviceLon=0&deviceMake=samsung&deviceModel=samsung&deviceType=samsung-tvplus&deviceVersion=unknown&embedPartner=samsung-tvplus&profileFloor=&profileLimit=&samsung_app_domain={APP_DOMAIN}&samsung_app_name={APP_NAME}&us_privacy=1YNY" },
  { id: "pluto-horror-it", name: "Pluto TV Horror", genre: "horror", streamUrl: "https://stitcher-ipv4.pluto.tv/v1/stitch/embed/hls/channel/61c09e3ac210ed0007606620/master.m3u8?advertisingId={PSID}&appVersion=unknown&deviceDNT={TARGETOPT}&deviceId={PSID}&deviceLat=0&deviceLon=0&deviceMake=samsung&deviceModel=samsung&deviceType=samsung-tvplus&deviceVersion=unknown&embedPartner=samsung-tvplus&profileFloor=&profileLimit=&samsung_app_domain={APP_DOMAIN}&samsung_app_name={APP_NAME}&us_privacy=1YNY" },
  { id: "pluto-kids-it", name: "Pluto TV Kids", genre: "family", streamUrl: "https://stitcher-ipv4.pluto.tv/v1/stitch/embed/hls/channel/62444e195d2ab7000861694b/master.m3u8?advertisingId={PSID}&appVersion=unknown&deviceDNT={TARGETOPT}&deviceId={PSID}&deviceLat=0&deviceLon=0&deviceMake=samsung&deviceModel=samsung&deviceType=samsung-tvplus&deviceVersion=unknown&embedPartner=samsung-tvplus&profileFloor=&profileLimit=&samsung_app_domain={APP_DOMAIN}&samsung_app_name={APP_NAME}&us_privacy=1YNY" },
  { id: "pluto-natura-it", name: "Pluto TV Natura", genre: "documentary", streamUrl: "https://stitcher-ipv4.pluto.tv/v1/stitch/embed/hls/channel/60802b37709d6b0007b0c549/master.m3u8?advertisingId={PSID}&appVersion=unknown&deviceDNT={TARGETOPT}&deviceId={PSID}&deviceLat=0&deviceLon=0&deviceMake=samsung&deviceModel=samsung&deviceType=samsung-tvplus&deviceVersion=unknown&embedPartner=samsung-tvplus&profileFloor=&profileLimit=&samsung_app_domain={APP_DOMAIN}&samsung_app_name={APP_NAME}&us_privacy=1YNY" },
  { id: "pluto-reallife-it", name: "Pluto TV Real Life", genre: "reality", streamUrl: "https://stitcher-ipv4.pluto.tv/v1/stitch/embed/hls/channel/60801976f92a750007a0699c/master.m3u8?advertisingId={PSID}&appVersion=unknown&deviceDNT={TARGETOPT}&deviceId={PSID}&deviceLat=0&deviceLon=0&deviceMake=samsung&deviceModel=samsung&deviceType=samsung-tvplus&deviceVersion=unknown&embedPartner=samsung-tvplus&profileFloor=&profileLimit=&samsung_app_domain={APP_DOMAIN}&samsung_app_name={APP_NAME}&us_privacy=1YNY" },
  { id: "pluto-reality-it", name: "Pluto TV Reality", genre: "reality", streamUrl: "https://stitcher-ipv4.pluto.tv/v1/stitch/embed/hls/channel/61925f874b1ec000075e700a/master.m3u8?advertisingId={PSID}&appVersion=unknown&deviceDNT={TARGETOPT}&deviceId={PSID}&deviceLat=0&deviceLon=0&deviceMake=samsung&deviceModel=samsung&deviceType=samsung-tvplus&deviceVersion=unknown&embedPartner=samsung-tvplus&profileFloor=&profileLimit=&samsung_app_domain={APP_DOMAIN}&samsung_app_name={APP_NAME}&us_privacy=1YNY" },
  { id: "pluto-scifi-it", name: "Pluto TV Sci-Fi", genre: "sci-fi", streamUrl: "https://stitcher-ipv4.pluto.tv/v1/stitch/embed/hls/channel/61728bb9ee3773000840c1fa/master.m3u8?advertisingId={PSID}&appVersion=unknown&deviceDNT={TARGETOPT}&deviceId={PSID}&deviceLat=0&deviceLon=0&deviceMake=samsung&deviceModel=samsung&deviceType=samsung-tvplus&deviceVersion=unknown&embedPartner=samsung-tvplus&profileFloor=&profileLimit=&samsung_app_domain={APP_DOMAIN}&samsung_app_name={APP_NAME}&us_privacy=1YNY" },
  { id: "pluto-serie-it", name: "Pluto TV Serie", genre: "drama", streamUrl: "https://stitcher-ipv4.pluto.tv/v1/stitch/embed/hls/channel/60b9ff2722bfa400072676ef/master.m3u8?advertisingId={PSID}&appVersion=unknown&deviceDNT={TARGETOPT}&deviceId={PSID}&deviceLat=0&deviceLon=0&deviceMake=samsung&deviceModel=samsung&deviceType=samsung-tvplus&deviceVersion=unknown&embedPartner=samsung-tvplus&profileFloor=&profileLimit=&samsung_app_domain={APP_DOMAIN}&samsung_app_name={APP_NAME}&us_privacy=1YNY" },
  { id: "pluto-sport-it", name: "Pluto TV Sport", genre: "sports", streamUrl: "https://stitcher-ipv4.pluto.tv/v1/stitch/embed/hls/channel/608030eff4b6f70007e1684c/master.m3u8?advertisingId={PSID}&appVersion=unknown&deviceDNT={TARGETOPT}&deviceId={PSID}&deviceLat=0&deviceLon=0&deviceMake=samsung&deviceModel=samsung&deviceType=samsung-tvplus&deviceVersion=unknown&embedPartner=samsung-tvplus&profileFloor=&profileLimit=&samsung_app_domain={APP_DOMAIN}&samsung_app_name={APP_NAME}&us_privacy=1YNY" },
  { id: "pluto-viaggi-it", name: "Pluto TV Viaggi", genre: "lifestyle", streamUrl: "https://stitcher-ipv4.pluto.tv/v1/stitch/embed/hls/channel/63c923944207be0007fd0887/master.m3u8?advertisingId={PSID}&appVersion=unknown&deviceDNT={TARGETOPT}&deviceId={PSID}&deviceLat=0&deviceLon=0&deviceMake=samsung&deviceModel=samsung&deviceType=samsung-tvplus&deviceVersion=unknown&embedPartner=samsung-tvplus&profileFloor=&profileLimit=&samsung_app_domain={APP_DOMAIN}&samsung_app_name={APP_NAME}&us_privacy=1YNY" },
  { id: "pluto-western-it", name: "Pluto TV Western", genre: "western", streamUrl: "https://stitcher-ipv4.pluto.tv/v1/stitch/embed/hls/channel/62e7fb67478a5b0007e6c50c/master.m3u8?advertisingId={PSID}&appVersion=unknown&deviceDNT={TARGETOPT}&deviceId={PSID}&deviceLat=0&deviceLon=0&deviceMake=samsung&deviceModel=samsung&deviceType=samsung-tvplus&deviceVersion=unknown&embedPartner=samsung-tvplus&profileFloor=&profileLimit=&samsung_app_domain={APP_DOMAIN}&samsung_app_name={APP_NAME}&us_privacy=1YNY" },
  { id: "south-park-it", name: "South Park", genre: "comedy", streamUrl: "https://stitcher-ipv4.pluto.tv/v1/stitch/embed/hls/channel/62bc1f502b70e3000706298e/master.m3u8?advertisingId={PSID}&appVersion=unknown&deviceDNT={TARGETOPT}&deviceId={PSID}&deviceLat=0&deviceLon=0&deviceMake=samsung&deviceModel=samsung&deviceType=samsung-tvplus&deviceVersion=unknown&embedPartner=samsung-tvplus&profileFloor=&profileLimit=&samsung_app_domain={APP_DOMAIN}&samsung_app_name={APP_NAME}&us_privacy=1YNY" },
  { id: "teen-mom-it", name: "Teen Mom", genre: "reality", streamUrl: "https://stitcher-ipv4.pluto.tv/v1/stitch/embed/hls/channel/62e7fc8c0d061100083946a9/master.m3u8?advertisingId={PSID}&appVersion=unknown&deviceDNT={TARGETOPT}&deviceId={PSID}&deviceLat=0&deviceLon=0&deviceMake=samsung&deviceModel=samsung&deviceType=samsung-tvplus&deviceVersion=unknown&embedPartner=samsung-tvplus&profileFloor=&profileLimit=&samsung_app_domain={APP_DOMAIN}&samsung_app_name={APP_NAME}&us_privacy=1YNY" },
];

const genreColors = {
  sci_fi: 'from-blue-600 to-blue-700',
  'sci-fi': 'from-blue-600 to-blue-700',
  action: 'from-red-600 to-red-700',
  comedy: 'from-yellow-600 to-yellow-700',
  drama: 'from-purple-600 to-purple-700',
  reality: 'from-pink-600 to-pink-700',
  music: 'from-red-700 to-pink-700',
  gaming: 'from-green-600 to-green-700',
  anime: 'from-indigo-600 to-purple-700',
  thriller: 'from-gray-700 to-gray-800',
  lifestyle: 'from-amber-600 to-amber-700',
  documentary: 'from-green-700 to-green-800',
  family: 'from-cyan-600 to-cyan-700',
  classic: 'from-amber-800 to-amber-900',
  movies: 'from-violet-600 to-violet-700',
  romance: 'from-pink-700 to-red-600',
  horror: 'from-gray-800 to-black',
  sports: 'from-orange-600 to-orange-700',
  western: 'from-amber-700 to-amber-800',
  default: 'from-gray-600 to-gray-700'
};

const getGenreColor = (genre) => {
  const key = genre?.toLowerCase().replace('_', '-') || 'default';
  return genreColors[key] || genreColors.default;
};

export default function PlutoTVChannelsContainer() {
  const [selectedChannel, setSelectedChannel] = React.useState(null);
  const channelsWithImages = PLUTO_TV_CHANNELS;

  return (
    <section className="px-4 sm:px-4 mt-8">
      <div className="flex items-center gap-2 mb-6">
        <Tv className="w-5 h-5 text-[#E31E24]" />
        <div>
          <h2 className="text-2xl font-bold dark:text-white">Pluto TV</h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm">ערוצי טלוויזיה חיים וסרטים בחינם</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {channelsWithImages.map((channel, idx) => (
          <motion.div
            key={channel.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.03 }}
            whileHover={{ scale: 1.05 }}
            onClick={() => setSelectedChannel(channel)}
            className={`group relative rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all cursor-pointer h-40 bg-gradient-to-br ${getGenreColor(channel.genre)}`}
          >
            {/* Background Image */}
            {channel.image_url ? (
              <div className="absolute inset-0">
                <img
                  src={channel.image_url}
                  alt={channel.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent group-hover:from-black/80 transition-all" />
              </div>
            ) : null}

            {/* Content */}
            <div className="relative z-10 h-full flex flex-col items-center justify-center p-3 text-center">
              <Play className="w-6 h-6 text-white mb-2 group-hover:scale-125 transition-transform" />
              <h3 className="font-bold text-sm text-white line-clamp-2 group-hover:text-yellow-200 transition-colors">
                {channel.name}
              </h3>
              <span className="text-[10px] text-white/70 capitalize mt-1">
                {channel.genre}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Pluto TV Player Modal */}
      <AnimatePresence>
        {selectedChannel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSelectedChannel(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-6xl bg-black rounded-2xl overflow-hidden shadow-2xl"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-4 flex items-center justify-between">
                <div>
                  <h3 className="text-white font-bold text-lg">{selectedChannel.name}</h3>
                  <p className="text-gray-400 text-sm capitalize">{selectedChannel.genre}</p>
                </div>
                <button
                  onClick={() => setSelectedChannel(null)}
                  className="text-white hover:text-red-500 transition-colors p-2 rounded-full hover:bg-gray-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Player */}
              <div className="relative w-full" style={{ aspectRatio: '16 / 9' }}>
                <iframe
                  src={selectedChannel.streamUrl}
                  allow="fullscreen"
                  allowFullScreen
                  frameBorder="0"
                  className="w-full h-full"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}