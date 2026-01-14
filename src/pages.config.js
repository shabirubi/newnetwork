import Archive from './pages/Archive';
import Article from './pages/Article';
import Category from './pages/Category';
import ChannelsManager from './pages/ChannelsManager';
import GenerateReporterImages from './pages/GenerateReporterImages';
import GenerateTalkingHead from './pages/GenerateTalkingHead';
import Home from './pages/Home';
import Live from './pages/Live';
import NewsAdmin from './pages/NewsAdmin';
import NewsLoader from './pages/NewsLoader';
import PublicReports from './pages/PublicReports';
import ReporterQA from './pages/ReporterQA';
import Reporters from './pages/Reporters';
import Schedule from './pages/Schedule';
import TalkingHeads from './pages/TalkingHeads';
import WarRoom from './pages/WarRoom';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Archive": Archive,
    "Article": Article,
    "Category": Category,
    "ChannelsManager": ChannelsManager,
    "GenerateReporterImages": GenerateReporterImages,
    "GenerateTalkingHead": GenerateTalkingHead,
    "Home": Home,
    "Live": Live,
    "NewsAdmin": NewsAdmin,
    "NewsLoader": NewsLoader,
    "PublicReports": PublicReports,
    "ReporterQA": ReporterQA,
    "Reporters": Reporters,
    "Schedule": Schedule,
    "TalkingHeads": TalkingHeads,
    "WarRoom": WarRoom,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};