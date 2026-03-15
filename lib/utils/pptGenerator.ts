import pptxgen from 'pptxgenjs';

export interface SlideData {
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

/**
 * Generates a PowerPoint presentation from structured data and triggers a download.
 */
export async function generatePPT(data: PresentationData) {
    const pres = new pptxgen();

    // Set Presentation properties
    pres.title = data.title;
    pres.subject = 'Sermon Presentation';
    pres.author = 'Lifepoint AI';

    // Title Slide
    const titleSlide = pres.addSlide();
    titleSlide.background = { color: '18181b' }; // Darkness like Lifepoint style

    titleSlide.addText(data.title.toUpperCase(), {
        x: 0.5,
        y: 1.5,
        w: '90%',
        h: 1,
        fontSize: 44,
        color: 'ccf381', // Accent color
        bold: true,
        align: 'center',
        fontFace: 'Arial'
    });

    if (data.subtitle) {
        titleSlide.addText(data.subtitle, {
            x: 0.5,
            y: 2.6,
            w: '90%',
            h: 0.5,
            fontSize: 24,
            color: 'ffffff',
            align: 'center',
            italic: true
        });
    }

    // Content Slides
    data.slides.forEach((slide) => {
        const s = pres.addSlide();

        // Header
        s.addText(slide.title.toUpperCase(), {
            x: 0.5,
            y: 0.3,
            w: '90%',
            h: 0.6,
            fontSize: 28,
            color: '0d9488', // Teal
            bold: true,
        });

        // Body Content
        s.addText(slide.body, {
            x: 0.5,
            y: 1.2,
            w: '90%',
            h: 3.5,
            fontSize: 18,
            color: '333333',
            align: 'left',
            valign: 'top',
            bullet: true
        });

        // Scripture Footer
        if (slide.scripture) {
            s.addText(slide.scripture, {
                x: 0.5,
                y: 4.8,
                w: '90%',
                h: 0.5,
                fontSize: 14,
                color: '0d9488', // Teal to match brand
                italic: true,
                bold: true
            });
        }

        // Speaker Notes
        if (slide.speakerNotes) {
            s.addNotes(slide.speakerNotes);
        }

        // Footer branding
        s.addText('LIFEPOINT MINISTRY', {
            x: 0.5,
            y: 5.3,
            w: '90%',
            h: 0.3,
            fontSize: 10,
            color: 'cccccc',
            align: 'right'
        });
    });

    // Save/Download the File
    const filename = `${data.title.replace(/\s+/g, '_')}_Presentation.pptx`;
    await pres.writeFile({ fileName: filename });
}
