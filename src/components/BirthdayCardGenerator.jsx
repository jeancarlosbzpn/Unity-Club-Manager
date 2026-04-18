import React, { useRef, useState, useMemo } from 'react';
import html2canvas from 'html2canvas';
import { X, Download, PartyPopper, Gift, Sparkles, Star } from 'lucide-react';

const BIBLE_VERSES = [
    { text: "Porque yo sé los pensamientos que tengo acerca de vosotros, dice Jehová, pensamientos de paz, y no de mal, para daros el fin que esperáis.", citation: "Jeremías 29:11" },
    { text: "Este es el día que hizo Jehová; Nos gozaremos y alegraremos en él.", citation: "Salmos 118:24" },
    { text: "Jehová te bendiga, y te guarde; Jehová haga resplandecer su rostro sobre ti, y tenga de ti misericordia; Jehová alce sobre ti su rostro, y ponga en ti paz.", citation: "Números 6:24-26" },
    { text: "Porque por mí se aumentarán tus días, Y años de vida se te añadirán.", citation: "Proverbios 9:11" },
    { text: "Te dé conforme al deseo de tu corazón, Y cumpla todo tu consejo.", citation: "Salmos 20:4" },
    { text: "Deléitate asimismo en Jehová, Y él te concederá las peticiones de tu corazón.", citation: "Salmos 37:4" },
    { text: "Encomienda a Jehová tus obras, Y tus pensamientos serán afirmados.", citation: "Proverbios 16:3" },
    { text: "Lo saciaré de larga vida, Y le mostraré mi salvación.", citation: "Salmos 91:16" },
    { text: "Y hasta la vejez yo mismo, y hasta las canas os soportaré; yo hice, yo llevaré, yo soportaré y guardaré.", citation: "Isaías 46:4" },
    { text: "Enséñanos de tal modo a contar nuestros días, Que traigamos al corazón sabiduría.", citation: "Salmos 90:12" },
    { text: "Por la misericordia de Jehová no hemos sido consumidos, porque nunca decayeron sus misericordias. Nuevas son cada mañana; grande es tu fidelidad.", citation: "Lamentaciones 3:22-23" },
    { text: "Estando persuadido de esto, que el que comenzó en vosotros la buena obra, la perfeccionará hasta el día de Jesucristo.", citation: "Filipenses 1:6" },
    { text: "La bendición de Jehová es la que enriquece, Y no añade tristeza con ella.", citation: "Proverbios 10:22" },
    { text: "Bienaventurado todo aquel que teme a Jehová, Que anda en sus caminos.", citation: "Salmos 128:1" },
    { text: "Pero los que esperan a Jehová tendrán nuevas fuerzas; levantarán alas como las águilas; correrán, y no se cansarán; caminarán, y no se fatigarán.", citation: "Isaías 40:31" },
    { text: "Jehová es mi pastor; nada me faltará.", citation: "Salmos 23:1" },
    { text: "El ladrón no viene sino para hurtar y matar y destruir; yo he venido para que tengan vida, y para que la tengan en abundancia.", citation: "Juan 10:10" },
    { text: "Gustad, y ved que es bueno Jehová; Dichoso el hombre que confía en él.", citation: "Salmos 34:8" },
    { text: "Fíate de Jehová de todo tu corazón, Y no te apoyes en tu propia prudencia. Reconócelo en todos tus caminos, Y él enderezará tus veredas.", citation: "Proverbios 3:5-6" },
    { text: "Y el Dios de esperanza os llene de todo gozo y paz en el creer, para que abundéis en esperanza por el poder del Espíritu Santo.", citation: "Romanos 15:13" },
    { text: "Jehová te guardará de todo mal; Él guardará tu alma. Jehová guardará tu salida y tu entrada Desde ahora y para siempre.", citation: "Salmos 121:7-8" },
    { text: "Porque somos hechura suya, creados en Cristo Jesús para buenas obras, las cuales Dios preparó de antemano para que anduviésemos en ellas.", citation: "Efesios 2:10" },
    { text: "Bendice, alma mía, a Jehová, Y no olvides ninguno de sus beneficios.", citation: "Salmos 103:2" },
    { text: "Jehová te pastoreará siempre, y saciará tu alma en las sequías, y dará vigor a tus huesos; y serás como huerto de riego, y como manantial de aguas, cuyas aguas nunca faltan.", citation: "Isaías 58:11" },
    { text: "Mas la senda de los justos es como la luz de la aurora, Que va en aumento hasta que el día es perfecto.", citation: "Proverbios 4:18" },
    { text: "Me mostrarás la senda de la vida; En tu presencia hay plenitud de gozo; Delicias a tu diestra para siempre.", citation: "Salmos 16:11" },
    { text: "Y todo lo que hacéis, sea de palabra o de hecho, hacedlo todo en el nombre del Señor Jesús, dando gracias a Dios Padre por medio de él.", citation: "Colosenses 3:17" },
    { text: "El justo florecerá como la palmera; Crecerá como cedro en el Líbano.", citation: "Salmos 92:12" },
    { text: "Porque a mis ojos fuiste de gran estima, fuiste honorable, y yo te amé; daré, pues, hombres por ti, y naciones por tu vida.", citation: "Isaías 43:4" },
    { text: "Amando a Jehová tu Dios, atendiendo a su voz, y siguiéndole a él; porque él es vida para ti, y prolongación de tus días.", citation: "Deuteronomio 30:20" },
    { text: "He aquí, herencia de Jehová son los hijos; Cosa de estima el fruto del vientre.", citation: "Salmos 127:3" },
    { text: "El corazón alegre constituye buen remedio; Mas el espíritu triste seca los huesos.", citation: "Proverbios 17:22" },
    { text: "Abres tu mano, Y colmas de bendición a todo ser viviente.", citation: "Salmos 145:16" },
    { text: "Porque los montes se moverán, y los collados temblarán, pero no se apartará de ti mi misericordia, ni el pacto de mi paz se quebrantará, dijo Jehová, el que tiene misericordia de ti.", citation: "Isaías 54:10" },
    { text: "Tú coronas el año con tus bienes, Y tus nubes destilan grosura.", citation: "Salmos 65:11" },
    { text: "Y sabemos que a los que aman a Dios, todas las cosas les ayudan a bien, esto es, a los que conforme a su propósito son llamados.", citation: "Romanos 8:28" },
    { text: "Te alabaré; porque formidables, maravillosas son tus obras; Estoy maravillado, Y mi alma lo sabe muy bien.", citation: "Salmos 139:14" },
    { text: "Fuerza y honor son su vestidura; Y se ríe de lo por venir.", citation: "Proverbios 31:25" },
    { text: "He aquí Dios es salvación mía; me aseguraré y no temeré; porque mi fortaleza y mi canción es JAH Jehová, quien ha sido salvación para mí.", citation: "Isaías 12:2" },
    { text: "Porque sol y escudo es Jehová Dios; Gracia y gloria dará Jehová; No quitará el bien a los que andan en integridad.", citation: "Salmos 84:11" },
    { text: "Mi Dios, pues, suplirá todo lo que os falta conforme a sus riquezas en gloria en Cristo Jesús.", citation: "Filipenses 4:19" },
    { text: "Bienaventurado el hombre que teme a Jehová, Y en sus mandamientos se deleita en gran manera.", citation: "Salmos 112:1" },
    { text: "En lugar de vuestra doble confusión, y de vuestra deshonra, os alabarán en sus heredades; por lo cual en sus tierras poseerán doble honra, y tendrán perpetuo gozo.", citation: "Isaías 61:7" },
    { text: "Porque contigo está el manantial de la vida; En tu luz veremos la luz.", citation: "Salmos 36:9" },
    { text: "Porque el que me halle, hallará la vida, Y alcanzará el favor de Jehová.", citation: "Proverbios 8:35" },
    { text: "Bendito sea Dios, Que no echó de sí mi oración, ni de mí su misericordia.", citation: "Salmos 66:20" },
    { text: "Porque con alegría saldréis, y con paz seréis vueltos; los montes y los collados levantarán canción delante de vosotros, y todos los árboles del campo darán palmadas de aplauso.", citation: "Isaías 55:12" },
    { text: "Aumentará Jehová bendición sobre vosotros; Sobre vosotros y sobre vuestros hijos.", citation: "Salmos 115:14" },
    { text: "Has aumentado, oh Jehová Dios mío, tus maravillas; Y tus pensamientos para con nosotros, No es posible contarlos ante ti.", citation: "Salmos 40:5" },
    { text: "Amado, yo deseo que tú seas prosperado en todas las cosas, y que tengas salud, así como prospera tu alma.", citation: "3 Juan 1:2" }
];

const BirthdayCardGenerator = ({ member, onClose }) => {
    const cardRef = useRef(null);
    const [isGenerating, setIsGenerating] = useState(false);

    // Generate random verse only once on mount
    const randomVerse = useMemo(() => {
        const randomIndex = Math.floor(Math.random() * BIBLE_VERSES.length);
        return BIBLE_VERSES[randomIndex];
    }, []);

    const handleDownload = async () => {
        if (!cardRef.current) return;
        setIsGenerating(true);

        try {
            const canvas = await html2canvas(cardRef.current, {
                scale: 3,
                useCORS: true,
                backgroundColor: null,
                allowTaint: true,
                logging: false,
                scrollY: 0, // Prevent scroll offset issues
                windowWidth: 800, // Explicit dimensions to help alignment
                windowHeight: 1200,
                onclone: (clonedDoc) => {
                    // Fix vertical alignment specifically for the generated image
                    const badges = clonedDoc.querySelectorAll('[data-adjust="badge-text"]');
                    badges.forEach(badge => {
                        badge.style.transform = 'translateY(-6px)'; // Lift text specifically for capture
                        badge.style.display = 'inline-block'; // Ensure transform applies
                        badge.style.marginTop = '-2px'; // Fine-tune lift
                    });
                }
            });

            const image = canvas.toDataURL("image/png");
            const link = document.createElement("a");
            link.href = image;
            link.download = `Feliz_Cumple_${member.firstName}_${member.lastName}.png`;
            link.click();
        } catch (error) {
            console.error("Error generating birthday card:", error);
            alert("Hubo un error al generar la imagen. Intenta de nuevo.");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        <Gift className="w-5 h-5 text-purple-600" />
                        Tarjeta de Cumpleaños
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-500 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content / Preview Area - Scrollable */}
                <div className="p-4 overflow-y-auto flex-1 flex flex-col items-center bg-gray-200 dark:bg-gray-900 justify-center">

                    <p className="mb-4 text-xs text-gray-500 dark:text-gray-400 text-center">
                        Vista previa (se generará en alta calidad)
                    </p>

                    {/* THE CARD ITSELF - Fixed Layout Size for consistent export */}
                    <div
                        ref={cardRef}
                        className="relative flex flex-col shadow-2xl overflow-hidden shrink-0"
                        style={{
                            width: '800px',
                            height: '1200px', // Fixed aspect ratio (2:3)
                            backgroundColor: '#003B70' // Club Blue
                        }}
                    >
                        {/* Decorative Background - Triangle/Scarf Motif */}
                        <div className="absolute top-0 right-0 w-full h-full overflow-hidden pointer-events-none">
                            {/* Red Triangle (Scarf/Pañoleta style sort of) */}
                            <div className="absolute top-[-150px] right-[-150px] w-[300px] h-[300px] bg-[#D92C27] rotate-45 transform shadow-lg"></div>
                            {/* Yellow Strip */}
                            <div className="absolute top-[-140px] right-[-140px] w-[280px] h-[280px] border-[10px] border-[#FABD00] rotate-45 transform opacity-80"></div>

                            {/* Bottom Left Accent */}
                            <div className="absolute bottom-[-50px] left-[-50px] w-[150px] h-[150px] bg-[#FABD00] rounded-full opacity-20 blur-xl"></div>
                        </div>

                        {/* Globe/World Icon Watermark (Subtle) */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                            <svg viewBox="0 0 24 24" fill="white" className="w-[300px] h-[300px]">
                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
                                <path d="M2 12h20 M12 2v20 M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" stroke="currentColor" strokeWidth="2" fill="none" />
                            </svg>
                        </div>

                        {/* Inner Border (Gold) */}
                        <div className="absolute inset-6 border-4 border-[#FABD00] rounded-lg pointer-events-none opacity-50"></div>

                        {/* Content Container */}
                        <div className="relative z-10 flex-1 flex flex-col items-center p-16 text-center text-white h-full justify-between">

                            {/* 1. Header Section */}
                            <div className="flex flex-col items-center mt-2 shrink-0">
                                {/* Icon Header */}
                                <div className="flex items-center gap-6 mb-6">
                                    <Star className="w-12 h-12 text-[#FABD00] fill-current" />
                                    <div className="bg-[#FABD00] text-[#003B70] px-6 h-12 rounded-sm font-bold tracking-widest text-xl uppercase shadow-sm flex items-center justify-center leading-none">
                                        <span data-adjust="badge-text">Conquistadores</span>
                                    </div>
                                    <Star className="w-12 h-12 text-[#FABD00] fill-current" />
                                </div>

                                <h1 className="text-6xl font-extrabold tracking-wide drop-shadow-lg leading-tight font-serif text-white mb-6">
                                    ¡Felicidades!
                                </h1>
                            </div>

                            {/* 2. Photo Section - Centered */}
                            <div className="relative group shrink-0 my-6">
                                {/* Ring behind photo */}
                                <div className="absolute -inset-2 bg-[#FABD00] rounded-full opacity-80 shadow-[0_0_30px_#FABD00]"></div>

                                <div className="relative w-64 h-64 rounded-full border-[6px] border-white shadow-2xl overflow-hidden bg-white flex items-center justify-center">
                                    {member.photo ? (
                                        <img
                                            src={member.photo}
                                            alt={member.firstName}
                                            className="w-full h-full object-cover"
                                            crossOrigin="anonymous"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-[#E5E7EB] flex items-center justify-center">
                                            <span className="text-9xl font-bold text-[#003B70]">{member.firstName[0]}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Badge */}
                                <div className="absolute -bottom-3 left-0 right-0 mx-auto w-max bg-[#D92C27] text-white px-6 h-9 rounded-sm shadow-md border border-white/20 whitespace-nowrap flex items-center justify-center">
                                    <span data-adjust="badge-text" className="text-xl font-bold uppercase tracking-widest leading-none">Cumpleañero/a</span>
                                </div>
                            </div>

                            {/* 3. Name, Age, Date & Verse Section */}
                            <div className="flex flex-col items-center justify-end w-full mb-12 gap-6 min-h-0 flex-1 relative z-20">

                                {/* Member Name */}
                                <div className="w-full shrink-0 mb-4">
                                    <h2 className="text-5xl font-bold drop-shadow-md leading-tight break-words px-4 font-serif text-white">
                                        {member.firstName}
                                    </h2>
                                    <h2 className="text-4xl font-bold drop-shadow-md text-[#FABD00] leading-tight break-words px-4 font-serif uppercase tracking-wide">
                                        {member.lastName}
                                    </h2>
                                </div>

                                {/* Age and Date Badge */}
                                <div className="flex flex-col items-center gap-1 my-0">
                                    {member.dateOfBirth && (
                                        <>
                                            <div className="bg-[#D92C27] text-white px-8 h-10 rounded-full shadow-md border border-white/20 flex items-center justify-center">
                                                <span data-adjust="badge-text" className="text-2xl font-bold tracking-wider leading-none">
                                                    {new Date().getFullYear() - new Date(member.dateOfBirth).getFullYear()} Años
                                                </span>
                                            </div>
                                            <p className="text-xl text-white/90 font-medium capitalize mt-2 tracking-wide">
                                                {new Date(new Date().getFullYear(), new Date(member.dateOfBirth + 'T12:00:00').getMonth(), new Date(member.dateOfBirth + 'T12:00:00').getDate()).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                            </p>
                                        </>
                                    )}
                                </div>

                                {/* Bible Verse Card - Compact padding, responsive width */}
                                <div className="mt-4 bg-white/10 backdrop-blur-md rounded-xl p-10 mx-4 w-auto border border-white/10 shadow-lg flex flex-col justify-center relative overflow-hidden group-hover:bg-white/15 transition-colors">
                                    <div className="absolute -left-2 top-0 bottom-0 w-2 bg-[#FABD00]"></div>
                                    <p className="text-2xl italic font-medium text-white/95 leading-relaxed font-serif relative z-10 px-2">
                                        "{randomVerse.text}"
                                    </p>
                                    <p className="text-lg text-[#FABD00] font-bold mt-4 text-right uppercase tracking-wider relative z-10">
                                        — {randomVerse.citation}
                                    </p>
                                </div>

                            </div>

                        </div>

                        {/* Festive Elements Overlay (Confetti/Balloons) */}
                        <div className="absolute inset-0 pointer-events-none overflow-hidden">
                            {/* Balloon 1 (Red) - Top Left */}
                            <div className="absolute top-[5%] left-[5%] opacity-90 animate-pulse" style={{ animationDuration: '3s' }}>
                                <svg width="100" height="130" viewBox="0 0 50 65">
                                    {/* String */}
                                    <path d="M25 50 Q 25 60 20 65" stroke="rgba(255,255,255,0.6)" strokeWidth="1" fill="none" />
                                    {/* Balloon */}
                                    <path d="M25 0 C 13 0 2 12 2 28 C 2 45 18 50 25 50 C 32 50 48 45 48 28 C 48 12 37 0 25 0 Z" fill="#D92C27" />
                                    {/* Shine */}
                                    <ellipse cx="15" cy="15" rx="5" ry="8" fill="white" opacity="0.3" transform="rotate(-30 15 15)" />
                                </svg>
                            </div>

                            {/* Balloon 2 (Gold) - Top Right */}
                            <div className="absolute top-[8%] right-[8%] opacity-90 animate-pulse" style={{ animationDuration: '4s' }}>
                                <svg width="90" height="120" viewBox="0 0 50 65">
                                    <path d="M25 50 Q 25 65 30 65" stroke="rgba(255,255,255,0.6)" strokeWidth="1" fill="none" />
                                    <path d="M25 0 C 13 0 2 12 2 28 C 2 45 18 50 25 50 C 32 50 48 45 48 28 C 48 12 37 0 25 0 Z" fill="#FABD00" />
                                    <ellipse cx="15" cy="15" rx="5" ry="8" fill="white" opacity="0.3" transform="rotate(-30 15 15)" />
                                </svg>
                            </div>

                            {/* Balloon 3 (Blue) - Mid Left Background */}
                            <div className="absolute top-[25%] left-[-5%] opacity-20 transform rotate-12">
                                <svg width="120" height="160" viewBox="0 0 50 65">
                                    <path d="M25 0 C 13 0 2 12 2 28 C 2 45 18 50 25 50 C 32 50 48 45 48 28 C 48 12 37 0 25 0 Z" fill="#003B70" />
                                </svg>
                            </div>

                            {/* EXPANDED CONFETTI */}
                            {/* Top/Mid Section */}
                            <div className="absolute top-[15%] left-[25%] w-3 h-3 bg-yellow-300 rotate-45 animate-bounce"></div>
                            <div className="absolute top-[10%] right-[30%] w-4 h-4 bg-red-400 rounded-full"></div>
                            <div className="absolute top-[20%] left-[10%] w-4 h-2 bg-white rotate-12"></div>
                            <div className="absolute top-[22%] right-[15%] w-3 h-3 bg-[#FABD00] rotate-45"></div>
                            <div className="absolute top-[5%] left-[50%] w-2 h-6 bg-red-300 rotate-12"></div>

                            {/* Around Photo */}
                            <div className="absolute top-[35%] left-[15%] w-4 h-4 bg-blue-300 rounded-full opacity-60"></div>
                            <div className="absolute top-[38%] right-[20%] w-4 h-4 bg-yellow-200 rotate-12 opacity-80"></div>
                            <div className="absolute top-[32%] left-[80%] w-3 h-3 bg-white rotate-45 opacity-60"></div>

                            {/* Bottom Section */}
                            <div className="absolute bottom-[30%] left-[8%] w-4 h-4 bg-[#D92C27] rounded-sm rotate-12"></div>
                            <div className="absolute bottom-[25%] right-[12%] w-3 h-6 bg-[#FABD00] -rotate-12"></div>
                            <div className="absolute bottom-[40%] right-[5%] w-4 h-4 bg-white rounded-full opacity-50"></div>
                            <div className="absolute bottom-[15%] left-[20%] w-2 h-4 bg-blue-400 rotate-45"></div>
                            <div className="absolute bottom-[40%] left-[5%] text-[#FABD00] opacity-40">
                                <Sparkles className="w-12 h-12" />
                            </div>

                            {/* Sparkles/Fireworks/Poppers */}
                            <PartyPopper className="absolute bottom-20 left-2 text-[#FABD00] w-16 h-16 opacity-40 rotate-12" />
                            <PartyPopper className="absolute bottom-32 right-2 text-[#D92C27] w-16 h-16 opacity-40 -rotate-12" />
                            <Star className="absolute top-12 left-1/2 text-white w-4 h-4 opacity-60 animate-pulse" />
                            <Star className="absolute bottom-10 right-1/4 text-yellow-200 w-6 h-6 opacity-60" />
                        </div>

                        {/* Footer Branding */}
                        <div className="relative z-10 bg-[#002f5a] pt-6 pb-4 px-8 text-center shrink-0 border-t-4 border-[#FABD00]">
                            <p className="text-xl font-bold text-white tracking-[0.2em] uppercase">
                                Club de Conquistadores Vencedores
                            </p>
                        </div>
                    </div>

                </div>

                {/* Footer Actions */}
                <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 flex justify-end gap-3 shrink-0">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
                    >
                        Cancelar
                    </button>

                    <button
                        onClick={handleDownload}
                        disabled={isGenerating}
                        className="px-6 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2 transform active:scale-95"
                    >
                        {isGenerating ? (
                            <span className="animate-pulse">Generando...</span>
                        ) : (
                            <>
                                <Download className="w-5 h-5" />
                                Descargar Imagen
                            </>
                        )}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default BirthdayCardGenerator;
