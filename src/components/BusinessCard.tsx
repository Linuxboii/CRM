import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Mail, Phone, Globe, Linkedin, Github, Twitter } from 'lucide-react';
import './BusinessCard.css';

interface BusinessCardProps {
    name?: string;
    title?: string;
    email?: string;
    phone?: string;
    website?: string;
    linkedinUrl?: string;
    githubUrl?: string;
    twitterUrl?: string;
    portfolioUrl?: string;
    tagline?: string;
}

export const BusinessCard: React.FC<BusinessCardProps> = ({
    name = "Pranav Avlok",
    title = "AI Solutions Architect",
    email = "pranav@example.com",
    phone = "+1 (555) 123-4567",
    website = "pranav.avlok.ai",
    linkedinUrl = "linkedin.com/in/pranav",
    githubUrl = "github.com/pranav",
    twitterUrl = "x.com/pranav",
    portfolioUrl = "https://pranav.avlok.ai/portfolio",
    tagline = "Automate. Simplify. Scale."
}) => {
    return (
        <div className="business-card-container">
            {/* FRONT FACE */}
            <div className="card card-front">
                <div className="card-bg-pattern"></div>
                <div className="card-content front-content">
                    <div className="logo-section">
                        <div className="logo-monogram">AI</div>
                    </div>
                    <div className="title-section">
                        <h1 className="name">{name}</h1>
                        <h2 className="title">{title}</h2>
                    </div>
                    <div className="accent-line"></div>
                </div>
            </div>

            {/* BACK FACE */}
            <div className="card card-back">
                <div className="card-bg-pattern subtle"></div>
                <div className="card-content back-content">

                    <div className="contact-section">
                        <div className="contact-row">
                            <Mail className="contact-icon" size={14} />
                            <span>{email}</span>
                        </div>
                        <div className="contact-row">
                            <Phone className="contact-icon" size={14} />
                            <span>{phone}</span>
                        </div>
                        <div className="contact-row">
                            <Globe className="contact-icon" size={14} />
                            <span>{website}</span>
                        </div>

                        <div className="social-row mt-auto">
                            {linkedinUrl && <div className="social-item"><Linkedin size={12} /> <span>{linkedinUrl}</span></div>}
                            {githubUrl && <div className="social-item"><Github size={12} /> <span>{githubUrl}</span></div>}
                            {twitterUrl && <div className="social-item"><Twitter size={12} /> <span>{twitterUrl}</span></div>}
                        </div>
                    </div>

                    <div className="qr-section">
                        <div className="qr-wrapper">
                            <QRCodeSVG
                                value={portfolioUrl}
                                size={84}
                                bgColor="#ffffff"
                                fgColor="#0a0e1a"
                                level="Q"
                                includeMargin={false}
                            />
                        </div>
                        <div className="tagline">
                            {tagline}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};
