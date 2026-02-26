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
import Terms from './pages/Terms';
import Reporters from './pages/Reporters';
import ReporterImagesLibrary from './pages/ReporterImagesLibrary';
import ReporterImageUpload from './pages/ReporterImageUpload';
import AdminPanel from './pages/AdminPanel';
import Home from './pages/Home';
import VideoEditor from './pages/VideoEditor';
import VODContent from './pages/VODContent';
import Archive from './pages/Archive';
import AvatarStudio from './pages/AvatarStudio';
import UserVideos from './pages/UserVideos';
import Article from './pages/Article';
import VideoCreator from './pages/VideoCreator';
import AIDesignStudio from './pages/AIDesignStudio';
import Category from './pages/Category';
import AnimationStudio from './pages/AnimationStudio';
import Schedule from './pages/Schedule';
import GenerateReporterImages from './pages/GenerateReporterImages';
import VOD from './pages/VOD';
import NewsAdmin from './pages/NewsAdmin';
import DownloadReporterImages from './pages/DownloadReporterImages';
import HeyGenGallery from './pages/HeyGenGallery';
import Live from './pages/Live';
import ReporterStudio from './pages/ReporterStudio';
import ChannelsManager from './pages/ChannelsManager';
import LumaStudio from './pages/LumaStudio';
import Accessibility from './pages/Accessibility';
import RegenerateImages from './pages/RegenerateImages';
import PublicReports from './pages/PublicReports';
import ToMovieeStudio from './pages/ToMovieeStudio';
import NewsLoader from './pages/NewsLoader';
import BroadcastStudio from './pages/BroadcastStudio';
import HeyGenEditor from './pages/HeyGenEditor';
import TestApps from './pages/TestApps';
import UserProfile from './pages/UserProfile';
import TestDID from './pages/TestDID';
import HeyGenHistory from './pages/HeyGenHistory';
import ReporterQA from './pages/ReporterQA';
import Subscription from './pages/Subscription';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Terms": Terms,
    "Reporters": Reporters,
    "ReporterImagesLibrary": ReporterImagesLibrary,
    "ReporterImageUpload": ReporterImageUpload,
    "AdminPanel": AdminPanel,
    "Home": Home,
    "VideoEditor": VideoEditor,
    "VODContent": VODContent,
    "Archive": Archive,
    "AvatarStudio": AvatarStudio,
    "UserVideos": UserVideos,
    "Article": Article,
    "VideoCreator": VideoCreator,
    "AIDesignStudio": AIDesignStudio,
    "Category": Category,
    "AnimationStudio": AnimationStudio,
    "Schedule": Schedule,
    "GenerateReporterImages": GenerateReporterImages,
    "VOD": VOD,
    "NewsAdmin": NewsAdmin,
    "DownloadReporterImages": DownloadReporterImages,
    "HeyGenGallery": HeyGenGallery,
    "Live": Live,
    "ReporterStudio": ReporterStudio,
    "ChannelsManager": ChannelsManager,
    "LumaStudio": LumaStudio,
    "Accessibility": Accessibility,
    "RegenerateImages": RegenerateImages,
    "PublicReports": PublicReports,
    "ToMovieeStudio": ToMovieeStudio,
    "NewsLoader": NewsLoader,
    "BroadcastStudio": BroadcastStudio,
    "HeyGenEditor": HeyGenEditor,
    "TestApps": TestApps,
    "UserProfile": UserProfile,
    "TestDID": TestDID,
    "HeyGenHistory": HeyGenHistory,
    "ReporterQA": ReporterQA,
    "Subscription": Subscription,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};