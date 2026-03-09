import { useState } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/PostDetail.css';

const PostDetail = () => {
    const { id } = useParams();

    // Mock data for the specific question
    const [question] = useState({
        id: id || 1,
        title: 'Java.lang.NoClassDefFoundError: org/eclipse/jetty/util/component/ContainerLifeCycle',
        content: `
            <p>I was writing a simple program to send requests to a certain api using java and i decided to use jetty-client for http request handling. So I added the dependency in my pom.xml.</p>
            <pre><code>
<dependency>
    <groupId>org.eclipse.jetty</groupId>
    <artifactId>jetty-client</artifactId>
    <version>9.4.44.v20210927</version>
</dependency>
            </code></pre>
            <p>But when I run the application, I keep getting a NoClassDefFoundError for ContainerLifeCycle. Any ideas what might be causing this issue?</p>
        `,
        author: {
            name: 'user123',
            avatar: 'U',
            reputation: 154
        },
        votes: 12,
        views: 216,
        tags: ['java', 'maven', 'jetty'],
        askedTime: '3 years, 1 month ago',
        modifiedTime: 'today'
    });

    // Mock data for answers
    const [answers] = useState([
        {
            id: 101,
            content: `
                <p>This usually happens when there is a mismatch in versions of different Jetty components. If you are using Spring Boot, it might be bringing in transitively a different version of Jetty.</p>
                <p>Try running <code>mvn dependency:tree</code> to check for conflicting versions of Jetty artifacts.</p>
            `,
            author: {
                name: 'expertJava',
                avatar: 'E',
                reputation: '45.2k'
            },
            votes: 24,
            isAccepted: true,
            answeredTime: '3 years ago'
        },
        {
            id: 102,
            content: `
                <p>I faced the exact same issue. In my case, adding <code>jetty-util</code> explicitly in my pom.xml solved the problem.</p>
            `,
            author: {
                name: 'devGuy',
                avatar: 'D',
                reputation: 890
            },
            votes: 2,
            isAccepted: false,
            answeredTime: '2 years ago'
        }
    ]);

    return (
        <div className="post-detail-layout">
            <Header />

            <div className="post-detail-container">
                {/* Left Sidebar */}
                <aside className="post-detail-sidebar">
                    <nav className="sidebar-nav">
                        <a href="/" className="nav-item">Trang chủ</a>
                        <a href="/posts" className="nav-item active">Câu hỏi</a>
                        <a href="/tags" className="nav-item">Tags</a>
                        <a href="/challenges" className="nav-item">Challenges</a>
                        <a href="/chat" className="nav-item">Chat</a>
                        <a href="/articles" className="nav-item">Articles</a>
                        <a href="/users" className="nav-item">Users</a>
                        <a href="/jobs" className="nav-item">Jobs</a>
                        <a href="/companies" className="nav-item">Companies</a>
                    </nav>

                    <div className="sidebar-section">
                        <h3 className="sidebar-title">COLLECTIVES</h3>
                        <a href="#" className="collective-link">Explore all Collectives</a>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="post-detail-main">
                    {/* Question Header */}
                    <div className="question-header-top">
                        <h1 className="question-header-title">{question.title}</h1>
                        <button className="btn-primary">Ask Question</button>
                    </div>

                    <div className="question-meta-bar">
                        <div className="meta-info">
                            <span className="meta-label">Asked</span>
                            <span className="meta-value">{question.askedTime}</span>
                        </div>
                        <div className="meta-info">
                            <span className="meta-label">Modified</span>
                            <span className="meta-value">{question.modifiedTime}</span>
                        </div>
                        <div className="meta-info">
                            <span className="meta-label">Viewed</span>
                            <span className="meta-value">{question.views} times</span>
                        </div>
                    </div>

                    <div className="post-content-layout">
                        {/* Vote Column */}
                        <div className="vote-col">
                            <button className="vote-btn" title="This question shows research effort; it is useful and clear">
                                <svg width="36" height="36" viewBox="0 0 36 36"><path d="M2 25h32L18 9 2 25Z" fill="currentColor"></path></svg>
                            </button>
                            <div className="vote-count">{question.votes}</div>
                            <button className="vote-btn" title="This question does not show any research effort; it is unclear or not useful">
                                <svg width="36" height="36" viewBox="0 0 36 36"><path d="M2 11h32L18 27 2 11Z" fill="currentColor"></path></svg>
                            </button>
                            <button className="bookmark-btn" title="Save to reading list">
                                <svg width="18" height="18" viewBox="0 0 18 18"><path d="M3 17V3c0-1.1.9-2 2-2h8a2 2 0 0 1 2 2v14l-6-4-6 4Z" fill="currentColor"></path></svg>
                            </button>
                        </div>

                        {/* Complete Question Content */}
                        <div className="post-cell">
                            <div className="post-body" dangerouslySetInnerHTML={{ __html: question.content }}></div>

                            <div className="post-tags-container">
                                {question.tags.map(tag => (
                                    <span key={tag} className="tag">{tag}</span>
                                ))}
                            </div>

                            <div className="post-author-row">
                                <div className="post-actions">
                                    <a href="#" className="post-action-link">Share</a>
                                    <a href="#" className="post-action-link">Edit</a>
                                    <a href="#" className="post-action-link">Follow</a>
                                </div>
                                <div className="author-card">
                                    <div className="author-timestamp">asked {question.askedTime}</div>
                                    <div className="author-info-box">
                                        <div className="author-avatar">{question.author.avatar}</div>
                                        <div className="author-details">
                                            <a href="#" className="author-name">{question.author.name}</a>
                                            <span className="author-reputation">{question.author.reputation}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Answers Section */}
                    <div className="answers-header">
                        <h2>{answers.length} Answers</h2>
                        <div className="sort-container">
                            <label>Sorted by:</label>
                            <select className="sort-select">
                                <option>Highest score (default)</option>
                                <option>Trending (recent votes count more)</option>
                                <option>Date modified (newest first)</option>
                                <option>Date created (oldest first)</option>
                            </select>
                        </div>
                    </div>

                    {answers.map(answer => (
                        <div key={answer.id} className="post-content-layout answer-item">
                            {/* Answer Vote Column */}
                            <div className="vote-col">
                                <button className="vote-btn">
                                    <svg width="36" height="36" viewBox="0 0 36 36"><path d="M2 25h32L18 9 2 25Z" fill="currentColor"></path></svg>
                                </button>
                                <div className="vote-count">{answer.votes}</div>
                                <button className="vote-btn">
                                    <svg width="36" height="36" viewBox="0 0 36 36"><path d="M2 11h32L18 27 2 11Z" fill="currentColor"></path></svg>
                                </button>
                                {answer.isAccepted && (
                                    <div className="accepted-mark" title="The question owner accepted this as the best answer">
                                        <svg width="36" height="36" viewBox="0 0 36 36"><path d="m6 14 8 8L30 6v8L14 30l-8-8v-8Z" fill="#2e7d32"></path></svg>
                                    </div>
                                )}
                            </div>

                            {/* Answer Content */}
                            <div className="post-cell">
                                <div className="post-body" dangerouslySetInnerHTML={{ __html: answer.content }}></div>

                                <div className="post-author-row answer-author-row">
                                    <div className="post-actions">
                                        <a href="#" className="post-action-link">Share</a>
                                        <a href="#" className="post-action-link">Edit</a>
                                        <a href="#" className="post-action-link">Follow</a>
                                    </div>
                                    <div className="author-card">
                                        <div className="author-timestamp">answered {answer.answeredTime}</div>
                                        <div className="author-info-box">
                                            <div className="author-avatar" style={{ backgroundColor: '#e1ecf4', color: '#39739d' }}>{answer.author.avatar}</div>
                                            <div className="author-details">
                                                <a href="#" className="author-name">{answer.author.name}</a>
                                                <span className="author-reputation">{answer.author.reputation}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Your Answer Form */}
                    <div className="your-answer-section">
                        <h2>Your Answer</h2>
                        <div className="editor-container">
                            <textarea className="answer-textarea" rows="10" placeholder="Write your answer here..."></textarea>
                        </div>
                        <button className="btn-primary post-answer-btn">Post Your Answer</button>
                    </div>
                </main>

                {/* Right Sidebar */}
                <aside className="post-detail-right-sidebar">
                    <div className="sidebar-widget">
                        <h3 className="widget-title">The Overflow Blog</h3>
                        <ul className="widget-list">
                            <li><a href="#">The unexpected benefits of mentoring others</a></li>
                            <li><a href="#">Podcast 354: Building for AR with Niantic Labs</a></li>
                        </ul>
                    </div>

                    <div className="sidebar-widget">
                        <h3 className="widget-title">Featured & Meta</h3>
                        <ul className="widget-list">
                            <li><a href="#">Beta release of Collectives™ on Stack Overflow</a></li>
                            <li><a href="#">Announcing Design Accessibility Updates</a></li>
                        </ul>
                    </div>

                    <div className="sidebar-widget">
                        <h3 className="widget-title">Hot Network Questions</h3>
                        <ul className="widget-list hot-questions">
                            <li><a href="#">Why does C++ allow undefined behavior?</a></li>
                            <li><a href="#">Can I use React hooks with class components?</a></li>
                            <li><a href="#">What is the difference between SQL and NoSQL?</a></li>
                        </ul>
                    </div>
                </aside>
            </div>

            <Footer />
        </div>
    );
};

export default PostDetail;
