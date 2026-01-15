import Archive from './pages/Archive';
import Article from './pages/Article';
import Category from './pages/Category';
import ChannelsManager from './pages/ChannelsManager';
import GenerateReporterImages from './pages/GenerateReporterImages';
import Live from './pages/Live';
import NewsAdmin from './pages/NewsAdmin';
import NewsLoader from './pages/NewsLoader';
import PublicReports from './pages/PublicReports';
import ReporterQA from './pages/ReporterQA';
import Reporters from './pages/Reporters';
import Schedule from './pages/Schedule';
import WarRoom from './pages/WarRoom';
import Home from './pages/Home';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Archive": Archive,
    "Article": Article,
    "Category": Category,
    "ChannelsManager": ChannelsManager,
    "GenerateReporterImages": GenerateReporterImages,
    "Live": Live,
    "NewsAdmin": NewsAdmin,
    "NewsLoader": NewsLoader,
    "PublicReports": PublicReports,
    "ReporterQA": ReporterQA,
    "Reporters": Reporters,
    "Schedule": Schedule,
    "WarRoom": WarRoom,
    "Home": Home,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};