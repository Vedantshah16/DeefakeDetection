import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const DeeperTechnicalSection = ({ title, children, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="mb-2" style={{ borderBottom: '1px solid var(--home-border)' }}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between py-3 text-left transition-colors"
                style={{ cursor: 'pointer', background: 'transparent', border: 'none', padding: '12px 0' }}
                aria-expanded={isOpen}
            >
                <span style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '13px',
                    fontWeight: 500,
                    color: 'var(--home-text-primary)',
                }}>
                    {title}
                </span>
                <ChevronDown
                    size={16}
                    style={{
                        color: 'var(--home-text-tertiary)',
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s',
                    }}
                />
            </button>

            <div
                className="overflow-hidden transition-all duration-200"
                style={{
                    maxHeight: isOpen ? '400px' : '0px',
                    opacity: isOpen ? 1 : 0,
                }}
            >
                <div style={{ paddingTop: '16px', paddingBottom: '16px' }}>
                    {children || (
                        <p style={{
                            fontFamily: 'var(--font-body)',
                            fontSize: '14px',
                            color: 'var(--home-text-tertiary)',
                            fontStyle: 'italic',
                            lineHeight: 1.6,
                        }}>
                            Detailed analysis data not available for this scan.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DeeperTechnicalSection;
