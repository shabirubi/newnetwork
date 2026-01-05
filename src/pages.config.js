import Article from './pages/Article';
import Category from './pages/Category';
import Home from './pages/Home';
import Live from './pages/Live';
import NewsAdmin from './pages/NewsAdmin';
import NewsLoader from './pages/NewsLoader';
import PublicReports from './pages/PublicReports';
import Schedule from './pages/Schedule';
import WarRoom from './pages/WarRoom';
import ChannelsManager from './pages/ChannelsManager';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Article": Article,
    "Category": Category,
    "Home": Home,
    "Live": Live,
    "NewsAdmin": NewsAdmin,
    "NewsLoader": NewsLoader,
    "PublicReports": PublicReports,
    "Schedule": Schedule,
    "WarRoom": WarRoom,
    "ChannelsManager": ChannelsManager,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};