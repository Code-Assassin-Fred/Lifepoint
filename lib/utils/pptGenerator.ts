import pptxgen from 'pptxgenjs';

export interface SlideData {
    slideType?: 'title' | 'section_divider' | 'content' | 'scripture_focus' | 'application' | 'closing';
    layoutVariant?: string;
    accentColor?: string;
    bgPattern?: string;
    title: string;
    body: string;
    scripture?: string;
    speakerNotes?: string;
}


export interface PresentationData {
    title: string;
    subtitle?: string;
    slides: SlideData[];
}

const COLORS = {
    bg: '0F172A',         // Slate 900
    accent: 'CCF381',     // Lime
    secondary: '0D9488',  // Teal 600
    text: 'FFFFFF',       // White
    muted: '94A3B8',      // Slate 400
    highlight: '4831D4'   // Deep Purple / Indigo
};

/**
 * Generates a professional PowerPoint presentation from structured data.
 */
export async function generatePPT(data: PresentationData) {
    const pres = new pptxgen();

    pres.layout = 'LAYOUT_16x9';
    pres.title = data.title;
    pres.author = 'Lifepoint AI';

    // 1. TITLE SLIDE
    const titleSlide = pres.addSlide();
    titleSlide.background = { color: COLORS.bg };

    // Decorative shape
    titleSlide.addShape(pres.ShapeType.rect, {
        x: 0, y: 0, w: '100%', h: 0.1, fill: { color: COLORS.accent }
    });

    titleSlide.addText(data.title.toUpperCase(), {
        x: 0.5, y: 1.8, w: '90%', fontSize: 48, color: COLORS.accent, bold: true, align: 'center', fontFace: 'Impact'
    });

    if (data.subtitle) {
        titleSlide.addText(data.subtitle, {
            x: 0.5, y: 3.0, w: '90%', fontSize: 22, color: COLORS.text, align: 'center', italic: true, fontFace: 'Arial'
        });
    }

    // Ministry Tag
    titleSlide.addText('LIFEPOINT MINISTRY | AI ASSISTED STUDY', {
        x: 0, y: 5.0, w: '100%', fontSize: 10, color: COLORS.muted, align: 'center', charSpacing: 4
    });

    // 2. CONTENT SLIDES
    data.slides.forEach((slide) => {
        const s = pres.addSlide();
        s.background = { color: COLORS.bg };

        const type = slide.slideType || 'content';

        switch (type) {
            case 'section_divider':
                // Accent Bar
                s.addShape(pres.ShapeType.rect, {
                    x: '10%', y: '45%', w: '80%', h: 0.05, fill: { color: COLORS.accent }
                });
                s.addText(slide.title.toUpperCase(), {
                    x: 0, y: '48%', w: '100%', fontSize: 42, color: COLORS.accent, bold: true, align: 'center'
                });
                break;

            case 'scripture_focus':
                // Large quotation marks
                s.addText('"', { x: 0.5, y: 0.8, fontSize: 80, color: COLORS.secondary, opacity: 0.3 });

                s.addText(slide.scripture || slide.body, {
                    x: 1.0, y: 1.5, w: 8.0, h: 3.0, fontSize: 28, color: COLORS.text, italic: true, align: 'center', valign: 'middle'
                });

                s.addText(`— ${slide.title}`, {
                    x: 1.0, y: 4.5, w: 8.0, fontSize: 18, color: COLORS.secondary, align: 'right', bold: true
                });
                break;

            case 'application':
                s.addText(slide.title.toUpperCase(), {
                    x: 0.5, y: 0.4, w: '90%', fontSize: 32, color: COLORS.accent, bold: true
                });
                s.addShape(pres.ShapeType.rect, {
                    x: 0.5, y: 1.0, w: 2.0, h: 0.05, fill: { color: COLORS.accent }
                });
                s.addText(slide.body, {
                    x: 0.8, y: 1.5, w: 8.4, h: 3.5, fontSize: 20, color: COLORS.text, bullet: { type: 'number' }, lineSpacing: 35
                });
                break;

            case 'closing':
                s.addShape(pres.ShapeType.rect, {
                    x: 0, y: 0, w: '100%', h: '100%', fill: { color: COLORS.secondary, transparency: 85 }
                });
                s.addText(slide.title.toUpperCase(), {
                    x: 0, y: 2.0, w: '100%', fontSize: 44, color: COLORS.accent, bold: true, align: 'center'
                });
                s.addText(slide.body, {
                    x: 1.0, y: 3.2, w: 8.0, fontSize: 20, color: COLORS.text, align: 'center'
                });
                break;

            default: // Standard 'content' slide
                // Header Bar Shape
                s.addShape(pres.ShapeType.rect, {
                    x: 0.5, y: 0.3, w: 0.3, h: 0.6, fill: { color: COLORS.secondary }
                });
                s.addText(slide.title.toUpperCase(), {
                    x: 1.0, y: 0.3, w: '80%', h: 0.6, fontSize: 28, color: COLORS.text, bold: true, align: 'left', valign: 'middle'
                });

                // Body text with clean bullets
                s.addText(slide.body, {
                    x: 0.8, y: 1.3, w: 8.4, h: 3.2, fontSize: 18, color: COLORS.text, align: 'left', valign: 'top', bullet: { code: '25B8' }, lineSpacing: 28
                });

                // Scripture highlight area
                if (slide.scripture) {
                    s.addShape(pres.ShapeType.rect, {
                        x: 0.5, y: 4.8, w: '90%', h: 0.6, fill: { color: COLORS.secondary, transparency: 90 }
                    });
                    s.addText(slide.scripture, {
                        x: 0.7, y: 4.8, w: '80%', h: 0.6, fontSize: 14, color: COLORS.accent, italic: true, bold: true, valign: 'middle'
                    });
                }
        }

        // Add Speaker Notes
        if (slide.speakerNotes) {
            s.addNotes(slide.speakerNotes);
        }

        // Branding and Slide Number
        s.addText('LIFEPOINT', { x: '85%', y: '92%', fontSize: 10, color: COLORS.muted });
    });

    const filename = `${data.title.replace(/\s+/g, '_')}_Presentation.pptx`;
    await pres.writeFile({ fileName: filename });
}

