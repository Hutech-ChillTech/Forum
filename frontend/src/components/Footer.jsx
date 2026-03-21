import '../styles/Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-columns">
                    {/* Column 1: STACK OVERFLOW */}
                    <div className="footer-column">
                        <h3 className="footer-title">SkillForum</h3>
                        <ul className="footer-links">
                            <li><a href="#">Questions</a></li>
                            <li><a href="#">Tags</a></li>
                            <li><a href="#">Chat</a></li>
                        </ul>
                    </div>

                    {/* Column 2: BUSINESS */}
                    <div className="footer-column">
                        <h3 className="footer-title">BUSINESS</h3>
                        <ul className="footer-links">
                            <li><a href="#">Stack Enterprise</a></li>
                            <li><a href="#">Stack Beta Licensing</a></li>
                            <li><a href="#">Stack Ads</a></li>
                        </ul>
                    </div>

                    {/* Column 3: COMPANY */}
                    <div className="footer-column">
                        <h3 className="footer-title">COMPANY</h3>
                        <ul className="footer-links">
                            <li><a href="#">About</a></li>
                            <li><a href="#">Press</a></li>
                            <li><a href="#">Work Here</a></li>
                            <li><a href="#">Legal</a></li>
                            <li><a href="#">Privacy Policy</a></li>
                            <li><a href="#">Terms of Service</a></li>
                            <li><a href="#">Contact Us</a></li>
                            <li><a href="#">Cookie Policy</a></li>
                        </ul>
                    </div>

                    {/* Column 4: STACK EXCHANGE NETWORK */}
                    <div className="footer-column">
                        <h3 className="footer-title">STACK EXCHANGE NETWORK</h3>
                        <ul className="footer-links">
                            <li><a href="#">Technology</a></li>
                            <li><a href="#">Culture & recreation</a></li>
                            <li><a href="#">Life & arts</a></li>
                            <li><a href="#">Science</a></li>
                            <li><a href="#">Professional</a></li>
                            <li><a href="#">Business</a></li>
                            <li><a href="#">API</a></li>
                            <li><a href="#">Data</a></li>
                        </ul>
                    </div>
                </div>

                {/* Bottom info */}
                <div className="footer-bottom">
                    <div className="footer-meta">
                        <span>Blog</span>
                        <span>Facebook</span>
                        <span>Twitter</span>
                        <span>LinkedIn</span>
                        <span>Instagram</span>
                    </div>
                    <p className="footer-copyright">
                        Site design / logo © 2024 Stack Exchange Inc; user contributions licensed under{' '}
                        <a href="#">CC BY-SA</a>. rev 2024.12.6.1234
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
