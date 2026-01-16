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
import ReporterQA from './pages/ReporterQA';
import Reporters from './pages/Reporters';
import Schedule from './pages/Schedule';
import TestDID from './pages/TestDID';
import WarRoom from './pages/WarRoom';
import VOD from './pages/VOD';
import __Layout from './Layout.jsx';


export const PAGES = {
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
    "ReporterQA": ReporterQA,
    "Reporters": Reporters,
    "Schedule": Schedule,
    "TestDID": TestDID,
    "WarRoom": WarRoom,
    "VOD": VOD,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};