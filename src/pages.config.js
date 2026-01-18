import Accessibility from './pages/Accessibility';
import Archive from './pages/Archive';
import Article from './pages/Article';
import Category from './pages/Category';
import ChannelsManager from './pages/ChannelsManager';
import GenerateReporterImages from './pages/GenerateReporterImages';
import Home from './pages/Home';
import Live from './pages/Live';
import NewsAdmin from './pages/NewsAdmin';
import NewsLoader from './pages/NewsLoader';
import PublicReports from './pages/PublicReports';
import RegenerateImages from './pages/RegenerateImages';
import ReporterQA from './pages/ReporterQA';
import Reporters from './pages/Reporters';
import Schedule from './pages/Schedule';
import Terms from './pages/Terms';
import TestApps from './pages/TestApps';
import TestDID from './pages/TestDID';
import VOD from './pages/VOD';
import WarRoom from './pages/WarRoom';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Accessibility": Accessibility,
    "Archive": Archive,
    "Article": Article,
    "Category": Category,
    "ChannelsManager": ChannelsManager,
    "GenerateReporterImages": GenerateReporterImages,
    "Home": Home,
    "Live": Live,
    "NewsAdmin": NewsAdmin,
    "NewsLoader": NewsLoader,
    "PublicReports": PublicReports,
    "RegenerateImages": RegenerateImages,
    "ReporterQA": ReporterQA,
    "Reporters": Reporters,
    "Schedule": Schedule,
    "Terms": Terms,
    "TestApps": TestApps,
    "TestDID": TestDID,
    "VOD": VOD,
    "WarRoom": WarRoom,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};