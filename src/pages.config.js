/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import AIDesignStudio from './pages/AIDesignStudio';
import Accessibility from './pages/Accessibility';
import AdminPanel from './pages/AdminPanel';
import AnimationStudio from './pages/AnimationStudio';
import Archive from './pages/Archive';
import Article from './pages/Article';
import AvatarStudio from './pages/AvatarStudio';
import BroadcastStudio from './pages/BroadcastStudio';
import Category from './pages/Category';
import ChannelsManager from './pages/ChannelsManager';
import DownloadReporterImages from './pages/DownloadReporterImages';
import GenerateReporterImages from './pages/GenerateReporterImages';
import HeyGenEditor from './pages/HeyGenEditor';
import HeyGenGallery from './pages/HeyGenGallery';
import HeyGenHistory from './pages/HeyGenHistory';
import Home from './pages/Home';
import Live from './pages/Live';
import LumaStudio from './pages/LumaStudio';
import NewsAdmin from './pages/NewsAdmin';
import NewsLoader from './pages/NewsLoader';
import PublicReports from './pages/PublicReports';
import RegenerateImages from './pages/RegenerateImages';
import ReporterImageUpload from './pages/ReporterImageUpload';
import ReporterImagesLibrary from './pages/ReporterImagesLibrary';
import ReporterQA from './pages/ReporterQA';
import ReporterStudio from './pages/ReporterStudio';
import Reporters from './pages/Reporters';
import Schedule from './pages/Schedule';
import Subscription from './pages/Subscription';
import Terms from './pages/Terms';
import TestApps from './pages/TestApps';
import TestDID from './pages/TestDID';
import ToMovieeStudio from './pages/ToMovieeStudio';
import UserProfile from './pages/UserProfile';
import UserVideos from './pages/UserVideos';
import VOD from './pages/VOD';
import VODContent from './pages/VODContent';
import VideoCreator from './pages/VideoCreator';
import VideoEditor from './pages/VideoEditor';
import WarRoom from './pages/WarRoom';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AIDesignStudio": AIDesignStudio,
    "Accessibility": Accessibility,
    "AdminPanel": AdminPanel,
    "AnimationStudio": AnimationStudio,
    "Archive": Archive,
    "Article": Article,
    "AvatarStudio": AvatarStudio,
    "BroadcastStudio": BroadcastStudio,
    "Category": Category,
    "ChannelsManager": ChannelsManager,
    "DownloadReporterImages": DownloadReporterImages,
    "GenerateReporterImages": GenerateReporterImages,
    "HeyGenEditor": HeyGenEditor,
    "HeyGenGallery": HeyGenGallery,
    "HeyGenHistory": HeyGenHistory,
    "Home": Home,
    "Live": Live,
    "LumaStudio": LumaStudio,
    "NewsAdmin": NewsAdmin,
    "NewsLoader": NewsLoader,
    "PublicReports": PublicReports,
    "RegenerateImages": RegenerateImages,
    "ReporterImageUpload": ReporterImageUpload,
    "ReporterImagesLibrary": ReporterImagesLibrary,
    "ReporterQA": ReporterQA,
    "ReporterStudio": ReporterStudio,
    "Reporters": Reporters,
    "Schedule": Schedule,
    "Subscription": Subscription,
    "Terms": Terms,
    "TestApps": TestApps,
    "TestDID": TestDID,
    "ToMovieeStudio": ToMovieeStudio,
    "UserProfile": UserProfile,
    "UserVideos": UserVideos,
    "VOD": VOD,
    "VODContent": VODContent,
    "VideoCreator": VideoCreator,
    "VideoEditor": VideoEditor,
    "WarRoom": WarRoom,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};