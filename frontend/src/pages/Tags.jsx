import { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Sidebar from '../components/Sidebar';
import ChatBox from '../components/ChatBox';
import '../styles/Tags.css';

const Tags = () => {
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('popular');

    // Mock tags data
    const [tags] = useState([
        {
            name: 'javascript',
            description: 'For questions about programming in ECMAScript (JavaScript/JS) and its different dialects/implementations (except for ActionScript).',
            questionsCount: 2533652,
            askedToday: 172
        },
        {
            name: 'python',
            description: 'Python is a dynamically typed, multi-paradigm programming language designed to be quick to learn, understand, and use, with a clean...',
            questionsCount: 2222093,
            askedToday: 183
        },
        {
            name: 'java',
            description: 'Java is a high-level object-oriented programming language. Use this tag when you\'re having problems using or understanding the language itself.',
            questionsCount: 1927819,
            askedToday: 86
        },
        {
            name: 'c#',
            description: 'C# (pronounced "see sharp") is a high-level, statically typed, multi-paradigm programming language developed by Microsoft.',
            questionsCount: 1677743,
            askedToday: 232
        },
        {
            name: 'php',
            description: 'PHP is an open-source, multi-paradigm, dynamically-typed and interpreted scripting language mainly for server-side web...',
            questionsCount: 1445779,
            askedToday: 108
        },
        {
            name: 'android',
            description: 'Android is Google\'s mobile operating system, used for programming or developing digital devices (Smartphones, Tablets, Automobiles...',
            questionsCount: 1419145,
            askedToday: 78
        },
        {
            name: 'html',
            description: 'HTML (HyperText Markup Language) is the markup language for creating web pages and other information to be displayed in a web browser.',
            questionsCount: 1170076,
            askedToday: 95
        },
        {
            name: 'jquery',
            description: 'jQuery is a JavaScript library. jQuery is a popular cross-browser JavaScript library that facilitates Document Object Model (DOM) traversal...',
            questionsCount: 1031142,
            askedToday: 28
        },
        {
            name: 'c++',
            description: 'C++ is a general-purpose programming language. Use this tag for questions about/utilizing C++. Do NOT use it for...',
            questionsCount: 818150,
            askedToday: 77
        },
        {
            name: 'css',
            description: 'CSS (Cascading Style Sheets) is a representation style sheet language used for describing the look and formatting of HTML...',
            questionsCount: 800330,
            askedToday: 138
        },
        {
            name: 'ios',
            description: 'iOS is the mobile operating system running on the Apple iPhone, iPod touch, and iPad. Use this tag [ios] for questions related to programming...',
            questionsCount: 680050,
            askedToday: 40
        },
        {
            name: 'sql',
            description: 'Structured Query Language (SQL) is a language for querying databases. Questions should include code examples, table structure...',
            questionsCount: 675638,
            askedToday: 124
        },
        {
            name: 'mysql',
            description: 'MySQL is a free, open-source Relational Database Management System (RDBMS) that uses Structured Query Language (SQL).',
            questionsCount: 659053,
            askedToday: 52
        },
        {
            name: 'r',
            description: 'R is a free, open-source programming language & software environment for statistical computing, bioinformatics, visualization & general computing.',
            questionsCount: 512322,
            askedToday: 39
        },
        {
            name: 'reactjs',
            description: 'React is a JavaScript library for building user interfaces. It uses a declarative, component-based paradigm and aims to be efficient...',
            questionsCount: 472054,
            askedToday: 45
        },
        {
            name: 'node.js',
            description: 'Node.js is an event-based, non-blocking, asynchronous I/O runtime that uses Google\'s V8 JavaScript engine and libuv library.',
            questionsCount: 427123,
            askedToday: 150
        }
    ]);

    // Filter tags based on search query
    const filteredTags = tags.filter(tag =>
        tag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tag.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Sort tags based on active tab
    const sortedTags = [...filteredTags].sort((a, b) => {
        if (activeTab === 'popular') {
            return b.questionsCount - a.questionsCount;
        } else if (activeTab === 'name') {
            return a.name.localeCompare(b.name);
        } else if (activeTab === 'new') {
            return b.askedToday - a.askedToday;
        }
        return 0;
    });

    // Format number with k/m suffix
    const formatCount = (count) => {
        if (count >= 1000000) {
            return (count / 1000000).toFixed(1) + 'm';
        } else if (count >= 1000) {
            return Math.floor(count / 1000) + 'k';
        }
        return count;
    };

    return (
        <div className="tags-layout">
            <Header />

            <div className="tags-container">
                {/* Left Sidebar */}
                <aside className="tags-sidebar">
                    <Sidebar activePage="tags" />
                </aside>

                {/* Main Content */}
                <main className="tags-main">
                    <div className="tags-header">
                        <h1 className="tags-title">Tags</h1>
                        <p className="tags-description">
                            A tag is a keyword or label that categorizes your question with other, similar questions. Using the right tags makes it easier for others to find and answer your question.
                        </p>
                        <a href="#" className="link-show-all">Show all tag synonyms</a>
                    </div>

                    {/* Search Bar */}
                    <div className="tags-search">
                        <svg className="search-icon" width="18" height="18" viewBox="0 0 18 18" fill="none">
                            <path d="M8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M16 16L12.65 12.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <input
                            type="text"
                            className="tags-search-input"
                            placeholder="Filter by tag name"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {/* Tabs */}
                    <div className="tags-tabs">
                        <button
                            className={`tab-btn ${activeTab === 'popular' ? 'active' : ''}`}
                            onClick={() => setActiveTab('popular')}
                        >
                            Popular
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'name' ? 'active' : ''}`}
                            onClick={() => setActiveTab('name')}
                        >
                            Name
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'new' ? 'active' : ''}`}
                            onClick={() => setActiveTab('new')}
                        >
                            New
                        </button>
                    </div>

                    {/* Tags Grid */}
                    <div className="tags-grid">
                        {sortedTags.map((tag) => (
                            <div key={tag.name} className="tag-card">
                                <a href={`/tags/${tag.name}`} className="tag-name-link">{tag.name}</a>
                                <p className="tag-description">{tag.description}</p>
                                <div className="tag-stats">
                                    <span className="tag-count">{formatCount(tag.questionsCount)} questions</span>
                                    <span className="tag-today">{tag.askedToday} asked today</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </main>
            </div>

            <button
                className="ai-chat-fab"
                onClick={() => setIsChatOpen(!isChatOpen)}
                title="Chat với AI"
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 012 2z" />
                </svg>
            </button>

            <ChatBox
                isOpen={isChatOpen}
                onClose={() => setIsChatOpen(false)}
            />

            <Footer />
        </div>
    );
};

export default Tags;
