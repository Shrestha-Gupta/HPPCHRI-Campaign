/**
 * HPPCHRI - Yuva Sanchar Interactive Self-Assessments
 * Based on Yuva Sanchar Booklet Page 4 (Fagerström Tobacco Addiction Test)
 */

document.addEventListener('DOMContentLoaded', () => {
  initTobaccoQuiz();
});

function initTobaccoQuiz() {
  const quizForm = document.getElementById('tobacco-quiz-form');
  const resultBox = document.getElementById('quiz-result-box');
  
  if (!quizForm || !resultBox) return;

  quizForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const q1Val = parseInt(document.getElementById('quiz-q1').value, 10);
    const q2Val = parseInt(document.getElementById('quiz-q2').value, 10);
    
    if (isNaN(q1Val) || isNaN(q2Val)) {
      alert('कृपया दोनों प्रश्नों के उत्तर चुनें / Please select answers for both questions.');
      return;
    }
    
    const totalScore = q1Val + q2Val;
    let riskLevel = '';
    let cssClass = '';
    let guidance = '';
    
    if (totalScore <= 2) {
      riskLevel = 'कम लत (Low Addiction Risk - Score: ' + totalScore + '/6)';
      cssClass = 'low';
      guidance = 'आपकी निकोटीन निर्भरता कम है। यह तंबाकू छोड़ने का सबसे उपयुक्त समय है। नियमित रूप से योग, संतुलित आहार और तंबाकू मुक्त वातावरण अपनाएं।';
    } else if (totalScore <= 4) {
      riskLevel = 'मध्यम लत (Moderate Addiction Risk - Score: ' + totalScore + '/6)';
      cssClass = 'medium';
      guidance = 'आप मध्यम निकोटीन निर्भरता की श्रेणी में हैं। समय रहते पेशेवर परामर्श और आदत बदलने के प्रयास से आप इसे पूरी तरह छोड़ सकते हैं।';
    } else {
      riskLevel = 'उच्च लत (High Addiction Risk - Score: ' + totalScore + '/6)';
      cssClass = 'high';
      guidance = 'आपकी तंबाकू लत गंभीर श्रेणी में है, जिससे मुख, फेफड़े और अन्य अंगों के कैंसर का जोखिम बहुत बढ़ जाता है। तुरंत नशा मुक्ति एवं कैंसर स्क्रीनिंग परामर्श लें।';
    }
    
    resultBox.className = 'quiz-result ' + cssClass;
    resultBox.style.display = 'block';
    resultBox.innerHTML = `
      <div style="font-weight: 700; margin-bottom: 6px; font-size: 1.05rem;">${riskLevel}</div>
      <p style="margin-bottom: 10px;">${guidance}</p>
      <div style="padding-top: 8px; border-top: 1px dashed rgba(0,0,0,0.15); font-size: 0.85rem;">
        📞 <strong>राष्ट्रीय तंबाकू मुक्ति टोल-फ्री हेल्पलाइन:</strong> <a href="tel:1800112356" style="text-decoration: underline; font-weight: bold;">1800 112 356</a><br>
        🏥 <strong>HPPCHRI कैंसर परामर्श हेल्पलाइन:</strong> <a href="tel:18008907526" style="text-decoration: underline; font-weight: bold;">1800 890 7526</a>
      </div>
    `;
  });
}
