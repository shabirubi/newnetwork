import Accessibility from './pages/Accessibility';
import Archive from './pages/Archive';
import Article from './pages/Article';
import Category from './pages/Category';
import ChannelsManager from './pages/ChannelsManager';
import DownloadReporterImages from './pages/DownloadReporterImages';
import GenerateReporterImages from './pages/GenerateReporterImages';
import Home from './pages/Home';
import Live from './pages/Live';
import NewsAdmin from './pages/NewsAdmin';
import NewsLoader from './pages/NewsLoader';
import PublicReports from './pages/PublicReports';
import RegenerateImages from './pages/RegenerateImages';
import ReporterImageUpload from './pages/ReporterImageUpload';
import ReporterImagesLibrary from './pages/ReporterImagesLibrary';
import ReporterQA from './pages/ReporterQA';
import Reporters from './pages/Reporters';
import Schedule from './pages/Schedule';
import Terms from './pages/Terms';
import TestApps from './pages/TestApps';
import TestDID from './pages/TestDID';
import VOD from './pages/VOD';
import WarRoom from './pages/WarRoom';
import UserVideos from './pages/UserVideos';
import VODContent from './pages/VODContent';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Accessibility": Accessibility,
    "Archive": Archive,
    "Article": Article,
    "Category": Category,
    "ChannelsManager": ChannelsManager,
    "DownloadReporterImages": DownloadReporterImages,
    "GenerateReporterImages": GenerateReporterImages,
    "Home": Home,
    "Live": Live,
    "NewsAdmin": NewsAdmin,
    "NewsLoader": NewsLoader,
    "PublicReports": PublicReports,
    "RegenerateImages": RegenerateImages,
    "ReporterImageUpload": ReporterImageUpload,
    "ReporterImagesLibrary": ReporterImagesLibrary,
    "ReporterQA": ReporterQA,
    "Reporters": Reporters,
    "Schedule": Schedule,
    "Terms": Terms,
    "TestApps": TestApps,
    "TestDID": TestDID,
    "VOD": VOD,
    "WarRoom": WarRoom,
    "UserVideos": UserVideos,
    "VODContent": VODContent,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};