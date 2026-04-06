const translations = {
  en: {
    login: {
      title: "Welcome Back",
      subtitle: "Sign in to your account",
      emailLabel: "Email",
      emailPlaceholder: "Enter your email",
      passwordLabel: "Password",
      passwordPlaceholder: "Enter your password",
      rememberMe: "Remember me",
      forgotPassword: "Forgot password?",
      signIn: "Sign In",
      noAccount: "Don't have an account?",
      signUp: "Sign up",
    },
    register: {
      title: "Create Account",
      subtitle: "Sign up to get started",
      nameLabel: "Full Name",
      namePlaceholder: "Enter your full name",
      emailLabel: "Email",
      emailPlaceholder: "Enter your email",
      passwordLabel: "Password",
      passwordPlaceholder: "Create a password",
      confirmPasswordLabel: "Confirm Password",
      confirmPasswordPlaceholder: "Confirm your password",
      terms: "I agree to the",
      termsLink: "Terms & Conditions",
      createAccount: "Create Account",
      haveAccount: "Already have an account?",
      signIn: "Sign in",
      passwordMismatch: "Passwords do not match!",
      sendCode: "Send Code",
      codeSentTo: "Verification code sent to:",
      codeLabel: "Verification Code",
      codePlaceholder: "6-digit code",
      resendCode: "Resend",
      verifyBtn: "Verify",
      backBtn: "Back",
    },
    dashboard: {
      siteName: "Digital literacy assessment",
      takeTest: "Take test",
      profile: "Profile",
      logout: "Log out",
      welcomePrefix: "Welcome",
      welcomeDesc: "Check your digital literacy and learn new skills.",
      statLastTest: "Last test",
      statTotalScore: "Total score",
      statAverage: "Average result",
      statBest: "Best result",
      motivationDefault:
        "🚀 Let's go! Take your first test and find out your level.",
      activityTitle: "Recent activity",
      activityEmpty: "No tests taken yet. Get started! →",
      digcompTitle: "DigComp Digital Competences",
      dc1Title: "Information search, evaluation and management",
      dc1Subtitle:
        "Finding, filtering and structuring information from the internet",
      dc11Title: "Information search",
      dc11Desc: "Effective use of search engines, choosing the right keywords.",
      dc12Title: "Evaluating sources",
      dc12Desc: "Distinguishing reliable from doubtful sources, fact-checking.",
      dc13Title: "Organizing information",
      dc13Desc: "Grouping saved files and links into folders, tagging.",
      dc2Title: "Communication and collaboration",
      dc2Subtitle:
        "Communicating and working together in the digital environment",
      dc21Title: "Digital communication channels",
      dc21Desc: "Effective use of email, messengers and video calls.",
      dc22Title: "Collaboration tools",
      dc22Desc:
        "Working with shared documents, online boards and project platforms.",
      dc23Title: "Digital footprint",
      dc23Desc:
        "Understanding and managing online reputation and digital footprint consequences.",
      dc24Title: "Online communities",
      dc24Desc:
        "Responsible participation in forums, social networks and groups.",
      dc25Title: "Cross-cultural communication",
      dc25Desc:
        "Ethical dialogue with representatives of different cultures in the digital environment.",
      dc26Title: "Netiquette",
      dc26Desc: "Following ethical norms of online communication.",
      dc3Title: "Content creation",
      dc3Subtitle: "Preparing documents, media and digital materials",
      dc31Title: "Working with documents",
      dc31Desc:
        "Creating and editing text documents, spreadsheets and presentations.",
      dc32Title: "Multimedia content",
      dc32Desc: "Preparing and editing images, audio and video materials.",
      dc33Title: "Copyright",
      dc33Desc: "Observing licenses and citation rules.",
      dc34Title: "Adapting content",
      dc34Desc: "Adapting materials for different audiences and devices.",
      dc4Title: "Safety, well-being and responsible use",
      dc4Subtitle: "Data security, health and responsibility",
      dc41Title: "Privacy and data protection",
      dc41Desc:
        "Passwords, two-factor authentication and personal data protection.",
      dc42Title: "Protection from threats",
      dc42Desc: "Recognizing viruses, phishing, scams and other cyber threats.",
      dc43Title: "Digital well-being",
      dc43Desc: "Managing screen time, psychological safety.",
      dc44Title: "Responsible use",
      dc44Desc:
        "Understanding online rights and responsibilities, compliance with the law.",
      dc5Title: "Problem identification and solving",
      dc5Subtitle: "Analysing and solving problems using digital tools",
      dc51Title: "Problem identification",
      dc51Desc:
        "Noticing and clearly formulating problems in the digital environment.",
      dc52Title: "Finding solutions",
      dc52Desc: "Using digital tools to find alternative solutions.",
      dc53Title: "Configuring tools",
      dc53Desc: "Adapting devices and applications to your own needs.",
      dc54Title: "Continuous learning",
      dc54Desc: "Continuously acquiring and updating digital skills.",
      quickActions: "Quick actions",
      actionTest: "Take test",
      actionTestDesc: "Take the digital literacy test and see your results.",
      actionProfile: "Profile",
      actionProfileDesc: "View your personal data and test results.",
      authModalTitle: "Login or registration required",
      authModalDesc: "Please log in or register to view this section.",
      authModalLogin: "Log in",
      authModalRegister: "Register",
      footer: "Digital literacy assessment information system",
    },
    profile: {
      siteName: "Digital literacy assessment",
      takeTest: "Take test",
      profile: "Profile",
      logout: "Log out",
      pageTitle: "Profile",
      pageDesc: "Your data and test statistics.",
      fullName: "Full name",
      email: "Email",
      level: "Level",
      levelPlaceholder: "Will be set after tests",
      completedTests: "Completed tests",
      completedTestsCount: "tests",
      testResultsTitle: "Test results",
      testResultsEmpty:
        "No tests completed yet. Pass a test to see results here.",
      backTitle: "Back to main page",
      backButton: "Main page",
      statLastTest: "Last test",
      statTotalScore: "Total score",
      statAverage: "Average result",
      statBest: "Best result",
      testResultsCardTitle: "Test results",
      fullStatsTitle: "Full statistics",
      statsAvg: "📈 Average result",
      statsLastActivity: "⏱️ Last activity",
      statsTotalScore: "💯 Total score",
      aiRecommendationsTitle: "🎯 Personal recommendations",
      aiBadge: "AI analysis",
      aiFooterBtn: "🤖 AI full analysis — available on test page",
      activityTitle: "Activity history",
      editBtn: "✏️ Edit",
      editModalTitle: "Edit profile",
      editNameLabel: "Full name",
      editNamePlaceholder: "Enter your name",
      editNewPassLabel: "New password (leave blank to keep)",
      editNewPassPlaceholder: "New password",
      editCurrentPassLabel: "Current password",
      editCurrentPassPlaceholder: "Your current password",
      editConfirmPassLabel: "Confirm new password",
      editConfirmPassPlaceholder: "Repeat new password",
      editSaveBtn: "Save",
      editSavingBtn: "Saving...",
      editNameRequired: "Please enter your name",
      editPassMismatch: "New passwords do not match",
      editSaveSuccess: "Saved successfully!",
      editSaveError: "Server connection error",
      authModalTitle: "Login or registration required",
      authModalDesc: "Please log in or register to view your profile.",
      authModalLogin: "Log in",
      authModalRegister: "Register",
      levelLow: "Low",
      levelMid: "Average",
      levelHigh: "High",
      scoreLabel: "points",
      retakeBtn: "Retake →",
      startBtn: "Start →",
      loading: "Loading...",
      noActivity: "No activity yet",
      aiAnalysisLabel: "AI analysis",
      aiSaved: "Saved:",
      aiNewBtn: "🔄 Get new analysis — on test page",
      aiGetBtn: "🤖 Get AI analysis — on test page",
      completedAll: "You completed all blocks! Great result.",
      tryRest: "Complete the remaining blocks to improve your result.",
      dailyTip: "If you practice daily, your result will improve by 30%.",
      reviewBlock: "We recommend reviewing the block",
      tookTest: "Took test",
      level1label: "Low",
      level2label: "Average",
      level3label: "High",
      moreBtn: "📋 More",
      collapseBtn: "▲ Collapse",
      registeredLabel: "Registered:",
    },
    test: {
      siteName: "Digital literacy assessment",
      takeTest: "Take test",
      profile: "Profile",
      logout: "Log out",
      pageTitle: "Take the test",
      pageSubtitle: "Determine your digital literacy level",
      bannerTitle: "Ready to start the test?",
      bannerDesc:
        "The test based on DigComp 2.2 will help you determine your digital literacy level.",
      bannerBtn: "Start the test",
      digcompTitle: "DigComp 2.2 — 5 Competencies",
      digcompSub: "The test measures your digital skills in these five areas",
      dc1Name: "Information and data literacy",
      dc1Desc:
        "Measures skills for finding, evaluating, storing and using information from the internet. The ability to detect misinformation and verify data reliability is the foundation of life in the digital world.",
      dc1Tag: "Search · Evaluation · Filtering",
      dc2Name: "Communication and collaboration",
      dc2Desc:
        "Assesses the ability to communicate effectively through digital channels, collaborate and participate in online communities. Ethics, cyber culture and digital citizenship concepts are included in this block.",
      dc2Tag: "Messenger · Collaboration · Ethics",
      dc3Name: "Digital content creation",
      dc3Desc:
        "Measures skills for creating, editing and sharing digital content such as text, images, and video. Copyright, licensing and programming basics also belong to this competency.",
      dc3Tag: "Content · Copyright · Programming",
      dc4Name: "Safety",
      dc4Desc:
        "Assesses skills for protecting personal data, password hygiene, protection from malware and recognizing online threats. Covers personal and collective security issues in the digital environment.",
      dc4Tag: "Data · Password · Phishing",
      dc5Name: "Problem solving",
      dc5Desc:
        "Measures the ability to independently solve technical problems, select digital tools for specific purposes and adapt to new situations with innovative approaches. Critical thinking is the key to digital development.",
      dc5Tag: "Technical · Adaptability · Solution",
      resultsTitle: "📊 Latest results",
      resultsSub: "Last test data based on DigComp 2.2",
      aiTitle: "🤖 AI analysis and recommendations",
      aiSub:
        "Analyzes your results and provides personalized advice for your profession",
      aiCardTitle: "AI personal analysis",
      aiCardDesc:
        "Analyzes your results across all blocks and creates a learning plan",
      aiBtn: "Start analysis",
      aiLoading: "AI is analyzing...",
      aiLoadingSub: "May take 10–20 seconds",
      aiResultTitle: "AI analysis",
      aiResultBadge: "Personal",
      aiSaved: "Saved:",
      aiError: "An error occurred. Please try again.",
      aiRetry: "Retry",
      modalTitle: "Login or registration required",
      modalDesc: "Please log in or register to start the test.",
      modalLogin: "Log in",
      modalRegister: "Register",
      emptyTitle: "No tests taken yet",
      emptyDesc: "Click the button above to start the test",
      emptyBtn: "→ Start the test",
      loading: "Loading...",
      overallLabel: "Total score",
      blocksCompleted: "/ 5 blocks completed",
      notTaken: "Not taken",
      levelDesc1:
        "Digital skills need development. You can improve your knowledge by working with basic resources.",
      levelDesc2:
        "Average level of digital literacy. You are capable of solving everyday tasks.",
      levelDesc3:
        "High level of digital literacy. You can independently solve complex situations.",
    },
  },
  kk: {
    login: {
      title: "Қош келдіңіз",
      subtitle: "Жүйеге кіріңіз",
      emailLabel: "Электрондық пошта",
      emailPlaceholder: "Электрондық поштаңызды енгізіңіз",
      passwordLabel: "Құпия сөз",
      passwordPlaceholder: "Құпия сөзіңізді енгізіңіз",
      rememberMe: "Мені есте сақта",
      forgotPassword: "Құпия сөзді ұмыттыңыз ба?",
      signIn: "Кіру",
      noAccount: "Есептік жазбаңыз жоқ па?",
      signUp: "Тіркелу",
    },

    register: {
      title: "Аккаунт құру",
      subtitle: "Бастау үшін тіркеліңіз",
      nameLabel: "Толық аты-жөні",
      namePlaceholder: "Толық аты-жөніңізді енгізіңіз",
      emailLabel: "Электрондық пошта",
      emailPlaceholder: "Электрондық поштаңызды енгізіңіз",
      passwordLabel: "Құпия сөз",
      passwordPlaceholder: "Құпия сөз құрыңыз",
      confirmPasswordLabel: "Құпия сөзді растау",
      confirmPasswordPlaceholder: "Құпия сөзіңізді растаңыз",
      terms: "Мен келісемін",
      termsLink: "Ережелер мен шарттарға",
      createAccount: "Есептік жазба құру",
      haveAccount: "Есептік жазбаңыз бар ма?",
      signIn: "Кіру",
      passwordMismatch: "Құпия сөздер сәйкес келмейді!",
      sendCode: "Код жіберу",
      codeSentTo: "Растау коды мына поштаға жіберілді:",
      codeLabel: "Растау коды",
      codePlaceholder: "6 таңбалы код",
      resendCode: "Қайта жіберу",
      verifyBtn: "Растау",
      backBtn: "Артқа",
    },
    dashboard: {
      siteName: "Цифрлық сауаттылықты бағалау",
      takeTest: "Тест тапсыру",
      profile: "Профиль",
      logout: "Шығу",
      welcomePrefix: "Қош келдіңіз",
      welcomeDesc:
        "Цифрлық сауаттылығыңызды тексеріп, жаңа дағдыларды игеріңіз.",
      statLastTest: "Соңғы тест",
      statTotalScore: "Жалпы балл",
      statAverage: "Орташа нәтиже",
      statBest: "Үздік нәтиже",
      motivationDefault:
        "🚀 Бастайық! Алғашқы тестті тапсырып, деңгейіңізді анықтаңыз.",
      activityTitle: "Соңғы белсенділік",
      activityEmpty: "Әлі тест тапсырылмаған. Бастаңыз! →",
      digcompTitle: "DigComp цифрлық құзыреттіліктері",
      dc1Title: "Ақпаратты іздеу, бағалау және басқару",
      dc1Subtitle: "Интернеттен ақпаратты табу, сүзгілеу және құрылымдау",
      dc11Title: "Ақпаратты іздеу",
      dc11Desc: "Іздеу жүйелерін тиімді пайдалану, кілт сөздерді дұрыс таңдау.",
      dc12Title: "Ақпарат көзін бағалау",
      dc12Desc:
        "Сенімді және күмәнді дереккөздерді ажырата білу, фактчек жасау.",
      dc13Title: "Ақпаратты ұйымдастыру",
      dc13Desc:
        "Сақталған файлдар мен сілтемелерді қалталарға топтастыру, тегтеу.",
      dc2Title: "Байланыс және ынтымақтастық",
      dc2Subtitle:
        "Цифрлық ортада қарым-қатынас жасау және бірлесіп жұмыс істеу",
      dc21Title: "Цифрлық байланыс арналары",
      dc21Desc:
        "Электрондық пошта, мессенджерлер және видеоқоңырауларды тиімді пайдалану.",
      dc22Title: "Ынтымақтастық құралдары",
      dc22Desc:
        "Ортақ құжаттармен, онлайн тақталармен және жобалық платформалармен жұмыс.",
      dc23Title: "Цифрлық із қалдыру",
      dc23Desc: "Онлайн бедел мен цифрлық іздің салдарын түсіну және басқару.",
      dc24Title: "Онлайн қауымдастықтар",
      dc24Desc:
        "Форумдарда, әлеуметтік желілерде және топтарда жауапты қатысу.",
      dc25Title: "Мәдениетаралық коммуникация",
      dc25Desc:
        "Әртүрлі мәдениет өкілдерімен цифрлық ортада этикалық диалог жүргізу.",
      dc26Title: "Нетикет",
      dc26Desc: "Онлайн қарым-қатынастың этикалық нормаларын сақтау.",
      dc3Title: "Контент жасау",
      dc3Subtitle: "Құжаттар, медиа және цифрлық материалдар дайындау",
      dc31Title: "Құжаттармен жұмыс",
      dc31Desc:
        "Мәтіндік құжаттар, кестелер және презентациялар құру және өңдеу.",
      dc32Title: "Мультимедиа контент",
      dc32Desc:
        "Сурет, аудио және бейне материалдар дайындау және редакциялау.",
      dc33Title: "Авторлық құқық",
      dc33Desc: "Лицензияларды және дәйексөз келтіру ережелерін сақтау.",
      dc34Title: "Контентті бейімдеу",
      dc34Desc:
        "Әртүрлі аудитория мен құрылғыларға арналған материалдарды бейімдеу.",
      dc4Title: "Қауіпсіздік, әл-ауқат және жауапты пайдалану",
      dc4Subtitle: "Деректер қауіпсіздігі, денсаулық және жауапкершілік",
      dc41Title: "Құпиялылық және деректерді қорғау",
      dc41Desc:
        "Құпия сөздер, екі факторлы аутентификация және жеке деректерді қорғау.",
      dc42Title: "Қауіптерден қорғану",
      dc42Desc: "Вирус, фишинг, скам және басқа да киберқауіптерді тану.",
      dc43Title: "Сандық әл-ауқат",
      dc43Desc: "Экран алдында уақытты басқару, психологиялық қауіпсіздік.",
      dc44Title: "Жауапты пайдалану",
      dc44Desc: "Онлайн құқықтар мен міндеттерді түсіну, заңды сақтау.",
      dc5Title: "Мәселені анықтау және шешу",
      dc5Subtitle: "Цифрлық құралдар арқылы проблемаларды талдау және шешу",
      dc51Title: "Мәселені анықтау",
      dc51Desc: "Цифрлық ортадағы проблемаларды байқау және нақты тұжырымдау.",
      dc52Title: "Шешім нұсқаларын табу",
      dc52Desc: "Цифрлық құралдарды пайдаланып, балама шешімдер іздеу.",
      dc53Title: "Құралдарды баптау",
      dc53Desc: "Құрылғылар мен қосымшаларды өз қажеттілігіне қарай бейімдеу.",
      dc54Title: "Үздіксіз оқу",
      dc54Desc: "Жаңа цифрлық дағдыларды үздіксіз меңгеру және жаңарту.",
      quickActions: "Жылдам әрекеттер",
      actionTest: "Тест тапсыру",
      actionTestDesc:
        "Цифрлық сауаттылық тестін тапсырып, нәтижеңізді біліңіз.",
      actionProfile: "Профиль",
      actionProfileDesc:
        "Жеке деректеріңізді және тест нәтижелеріңізді қараңыз.",
      authModalTitle: "Кіру немесе тіркелу қажет",
      authModalDesc: "Бұл бөлімді көру үшін жүйеге кіріңіз немесе тіркеліңіз.",
      authModalLogin: "Кіру",
      authModalRegister: "Тіркелу",
      footer: "Цифрлық сауаттылықты бағалау ақпараттық жүйесі",
    },
    profile: {
      siteName: "Цифрлық сауаттылықты бағалау",
      takeTest: "Тест тапсыру",
      profile: "Профиль",
      logout: "Шығу",
      pageTitle: "Профиль",
      pageDesc: "Сіздің деректеріңіз және тест статистикасы.",
      fullName: "Аты-жөні",
      email: "Электрондық пошта",
      level: "Деңгей",
      levelPlaceholder: "Тест тапсырғаннан кейін белгіленеді",
      completedTests: "Орындалған тесттер",
      completedTestsCount: "тест",
      testResultsTitle: "Тест нәтижелері",
      testResultsEmpty:
        "Әзірше тест тапсырылмаған. Нәтижелерді көру үшін тест тапсырыңыз.",
      backTitle: "Басты бетке оралу",
      backButton: "Басты бет",
      statLastTest: "Соңғы тест",
      statTotalScore: "Жалпы балл",
      statAverage: "Орташа нәтиже",
      statBest: "Үздік нәтиже",
      testResultsCardTitle: "Тест нәтижелері",
      fullStatsTitle: "Толық статистика",
      statsAvg: "📈 Орташа нәтиже",
      statsLastActivity: "⏱️ Соңғы белсенділік",
      statsTotalScore: "💯 Жалпы балл",
      aiRecommendationsTitle: "🎯 Жеке ұсыныстар",
      aiBadge: "ИИ талдауы",
      aiFooterBtn: "🤖 ИИ толық талдауы — тест бетінде қолжетімді",
      activityTitle: "Белсенділік тарихы",
      editBtn: "✏️ Өзгерту",
      editModalTitle: "Профильді өзгерту",
      editNameLabel: "Аты-жөні",
      editNamePlaceholder: "Атыңызды енгізіңіз",
      editNewPassLabel: "Жаңа құпия сөз (өзгертпесе бос қалдыр)",
      editNewPassPlaceholder: "Жаңа құпия сөз",
      editCurrentPassLabel: "Ағымдағы құпия сөз",
      editCurrentPassPlaceholder: "Қазіргі құпия сөзіңіз",
      editConfirmPassLabel: "Жаңа құпия сөзді растау",
      editConfirmPassPlaceholder: "Жаңа құпия сөзді қайталаңыз",
      editSaveBtn: "Сақтау",
      editSavingBtn: "Сақталуда...",
      editNameRequired: "Атыңызды енгізіңіз",
      editPassMismatch: "Жаңа құпия сөздер сәйкес келмейді",
      editSaveSuccess: "Сәтті сақталды!",
      editSaveError: "Сервермен байланыс жоқ",
      authModalTitle: "Кіру немесе тіркелу қажет",
      authModalDesc: "Профильді көру үшін жүйеге кіріңіз немесе тіркеліңіз.",
      authModalLogin: "Кіру",
      authModalRegister: "Тіркелу",
      levelLow: "Төмен",
      levelMid: "Орташа",
      levelHigh: "Жоғары",
      scoreLabel: "балл",
      retakeBtn: "Қайталау →",
      startBtn: "Тапсыру →",
      loading: "Жүктелуде...",
      noActivity: "Әлі белсенділік жоқ",
      aiAnalysisLabel: "AI талдауы",
      aiSaved: "Сақталған:",
      aiNewBtn: "🔄 Жаңа талдау алу — тест бетінде",
      aiGetBtn: "🤖 AI талдауын алу — тест бетінде",
      completedAll: "Барлық блоктарды аяқтадыңыз! Керемет нәтиже.",
      tryRest: "Қалған блоктарды аяқтау арқылы нәтижеңізді арттыра аласыз.",
      dailyTip: "Күн сайын жаттықсаңыз, нәтижеңіз 30%-ға артады.",
      reviewBlock: "блоктын қайталауды ұсынамыз",
      tookTest: "Тест тапсырды",
      level1label: "Төмен",
      level2label: "Орташа",
      level3label: "Жоғары",
      moreBtn: "📋 Толығырақ",
      collapseBtn: "▲ Жию",
      registeredLabel: "Тіркелген:",
    },
    test: {
      siteName: "Цифрлық сауаттылықты бағалау",
      takeTest: "Тест тапсыру",
      profile: "Профиль",
      logout: "Шығу",
      pageTitle: "Тест тапсыру",
      pageSubtitle: "Цифрлық сауаттылық деңгейіңізді анықтаңыз",
      bannerTitle: "Тестті бастауға дайынсыз ба?",
      bannerDesc:
        "DigComp 2.2 негізінде құрастырылған тест сіздің цифрлық сауаттылық деңгейіңізді анықтауға көмектеседі.",
      bannerBtn: "Сынақты бастау",
      digcompTitle: "DigComp 2.2 — 5 құзыреттілік",
      digcompSub: "Тест осы бес саладағы цифрлық дағдыларыңызды өлшейді",
      dc1Name: "Ақпарат және деректерге сауаттылық",
      dc1Desc:
        "Интернеттен ақпаратты табу, бағалау, сақтау және пайдалану дағдыларын өлшейді. Жалған ақпаратты анықтай алу, деректердің сенімділігін тексеру цифрлық ортада өмір сүрудің негізі болып табылады.",
      dc1Tag: "Іздеу · Бағалау · Сүзгілеу",
      dc2Name: "Коммуникация және ынтымақтастық",
      dc2Desc:
        "Цифрлық арналар арқылы тиімді қарым-қатынас жасау, бірлескен жұмыс істеу және онлайн қоғамдастықтарға қатысу мүмкіндіктерін бағалайды. Этика, кибермәдениет және цифрлық азаматтық ұғымдары осы блокқа кіреді.",
      dc2Tag: "Мессенджер · Ынтымақтастық · Этика",
      dc3Name: "Цифрлық контент жасау",
      dc3Desc:
        "Мәтін, сурет, видео сияқты цифрлық мазмұн құру, редакциялау және бөлісу дағдыларын өлшейді. Авторлық құқық, лицензиялау және бағдарламалау негіздері де осы құзыреттілікке жатады.",
      dc3Tag: "Мазмұн · Авторлық · Бағдарламалау",
      dc4Name: "Қауіпсіздік",
      dc4Desc:
        "Жеке деректерді қорғау, құпиясөз гигиенасы, зиянды бағдарламалардан сақтану және онлайн қауіп-қатерлерді тану дағдыларын бағалайды. Сандық ортадағы жеке және ұжымдық қауіпсіздік мәселелерін қамтиды.",
      dc4Tag: "Деректер · Құпиясөз · Фишинг",
      dc5Name: "Проблемаларды шешу",
      dc5Desc:
        "Техникалық мәселелерді өз бетінше шешу, цифрлық құралдарды мақсатқа сай таңдау және инновациялық тәсілдермен жаңа жағдайларға бейімделу қабілетін өлшейді. Сыни ойлау цифрлық дамудың кілті.",
      dc5Tag: "Техника · Бейімділік · Шешім",
      resultsTitle: "📊 Соңғы нәтижелер",
      resultsSub: "DigComp 2.2 негізінде тапсырылған соңғы тест деректері",
      aiTitle: "🤖 AI талдауы мен ұсыныстары",
      aiSub: "Нәтижеңізді талдап, мамандығыңызға сай жеке кеңес береді",
      aiCardTitle: "AI жеке талдауы",
      aiCardDesc:
        "Барлық блоктар бойынша нәтижеңізді талдап, оқу жоспары жасайды",
      aiBtn: "Талдауды бастау",
      aiLoading: "ЖИ талдап жатыр...",
      aiLoadingSub: "10–20 секунд алуы мүмкін",
      aiResultTitle: "AI талдауы",
      aiResultBadge: "Жеке",
      aiSaved: "Сақталған:",
      aiError: "Қате шықты. Қайталап көріңіз.",
      aiRetry: "Қайталау",
      modalTitle: "Кіру немесе тіркелу қажет",
      modalDesc: "Тестті бастау үшін жүйеге кіріңіз немесе тіркеліңіз.",
      modalLogin: "Кіру",
      modalRegister: "Тіркелу",
      emptyTitle: "Әлі тест тапсырылмаған",
      emptyDesc: "Жоғарыдағы батырманы басып тестті бастаңыз",
      emptyBtn: "→ Сынақты бастау",
      loading: "Жүктелуде...",
      overallLabel: "Жалпы балл",
      blocksCompleted: "/ 5 блок аяқталды",
      notTaken: "Тапсырылмаған",
      levelDesc1:
        "Цифрлық дағдыларды дамыту қажет. Негізгі ресурстармен жұмыс жасай отырып, білімді жетілдіруге болады.",
      levelDesc2:
        "Орташа деңгейдегі цифрлық сауаттылық. Күнделікті міндеттерді шешуге қабілеттісіз.",
      levelDesc3:
        "Жоғары деңгейдегі цифрлық сауаттылық. Күрделі жағдайларды өздігіңізбен шеше аласыз.",
    },
  },
  ru: {
    login: {
      title: "Добро пожаловать",
      subtitle: "Войдите в свой аккаунт",
      emailLabel: "Электронная почта",
      emailPlaceholder: "Введите вашу электронную почту",
      passwordLabel: "Пароль",
      passwordPlaceholder: "Введите ваш пароль",
      rememberMe: "Запомнить меня",
      forgotPassword: "Забыли пароль?",
      signIn: "Войти",
      noAccount: "Нет аккаунта?",
      signUp: "Зарегистрироваться",
    },

    register: {
      title: "Создать аккаунт",
      subtitle: "Зарегистрируйтесь, чтобы начать",
      nameLabel: "Полное имя",
      namePlaceholder: "Введите ваше полное имя",
      emailLabel: "Электронная почта",
      emailPlaceholder: "Введите вашу электронную почту",
      passwordLabel: "Пароль",
      passwordPlaceholder: "Создайте пароль",
      confirmPasswordLabel: "Подтвердите пароль",
      confirmPasswordPlaceholder: "Подтвердите ваш пароль",
      terms: "Я согласен с",
      termsLink: "Условиями использования",
      createAccount: "Создать аккаунт",
      haveAccount: "Уже есть аккаунт?",
      signIn: "Войти",
      passwordMismatch: "Пароли не совпадают!",
      sendCode: "Отправить код",
      codeSentTo: "Код подтверждения отправлен на:",
      codeLabel: "Код подтверждения",
      codePlaceholder: "6-значный код",
      resendCode: "Отправить снова",
      verifyBtn: "Подтвердить",
      backBtn: "Назад",
    },
    dashboard: {
      siteName: "Оценка цифровой грамотности",
      takeTest: "Пройти тест",
      profile: "Профиль",
      logout: "Выйти",
      welcomePrefix: "Добро пожаловать",
      welcomeDesc:
        "Проверьте свою цифровую грамотность и освойте новые навыки.",
      statLastTest: "Последний тест",
      statTotalScore: "Общий балл",
      statAverage: "Средний результат",
      statBest: "Лучший результат",
      motivationDefault:
        "🚀 Начнём! Пройдите первый тест и определите свой уровень.",
      activityTitle: "Последняя активность",
      activityEmpty: "Тесты ещё не пройдены. Начните прямо сейчас! →",
      digcompTitle: "Цифровые компетенции DigComp",
      dc1Title: "Поиск, оценка и управление информацией",
      dc1Subtitle:
        "Нахождение, фильтрация и структурирование информации из интернета",
      dc11Title: "Поиск информации",
      dc11Desc:
        "Эффективное использование поисковых систем, правильный подбор ключевых слов.",
      dc12Title: "Оценка источников",
      dc12Desc:
        "Умение отличать надёжные источники от сомнительных, проверка фактов.",
      dc13Title: "Организация информации",
      dc13Desc:
        "Группировка сохранённых файлов и ссылок по папкам, добавление тегов.",
      dc2Title: "Коммуникация и сотрудничество",
      dc2Subtitle: "Общение и совместная работа в цифровой среде",
      dc21Title: "Цифровые каналы связи",
      dc21Desc:
        "Эффективное использование электронной почты, мессенджеров и видеозвонков.",
      dc22Title: "Инструменты совместной работы",
      dc22Desc:
        "Работа с общими документами, онлайн-досками и проектными платформами.",
      dc23Title: "Цифровой след",
      dc23Desc:
        "Понимание и управление онлайн-репутацией и последствиями цифрового следа.",
      dc24Title: "Онлайн-сообщества",
      dc24Desc: "Ответственное участие в форумах, социальных сетях и группах.",
      dc25Title: "Межкультурная коммуникация",
      dc25Desc:
        "Этичный диалог с представителями разных культур в цифровой среде.",
      dc26Title: "Нетикет",
      dc26Desc: "Соблюдение этических норм общения в интернете.",
      dc3Title: "Создание контента",
      dc3Subtitle: "Подготовка документов, медиа и цифровых материалов",
      dc31Title: "Работа с документами",
      dc31Desc:
        "Создание и редактирование текстовых документов, таблиц и презентаций.",
      dc32Title: "Мультимедийный контент",
      dc32Desc:
        "Подготовка и редактирование изображений, аудио и видеоматериалов.",
      dc33Title: "Авторское право",
      dc33Desc: "Соблюдение лицензий и правил цитирования.",
      dc34Title: "Адаптация контента",
      dc34Desc: "Адаптация материалов для разной аудитории и устройств.",
      dc4Title: "Безопасность, благополучие и ответственное использование",
      dc4Subtitle: "Защита данных, здоровье и ответственность",
      dc41Title: "Конфиденциальность и защита данных",
      dc41Desc:
        "Пароли, двухфакторная аутентификация и защита персональных данных.",
      dc42Title: "Защита от угроз",
      dc42Desc: "Распознавание вирусов, фишинга, скама и других киберугроз.",
      dc43Title: "Цифровое благополучие",
      dc43Desc: "Управление экранным временем, психологическая безопасность.",
      dc44Title: "Ответственное использование",
      dc44Desc:
        "Понимание онлайн-прав и обязанностей, соблюдение законодательства.",
      dc5Title: "Выявление и решение проблем",
      dc5Subtitle: "Анализ и решение проблем с помощью цифровых инструментов",
      dc51Title: "Выявление проблемы",
      dc51Desc: "Обнаружение и чёткая формулировка проблем в цифровой среде.",
      dc52Title: "Поиск решений",
      dc52Desc:
        "Использование цифровых инструментов для поиска альтернативных решений.",
      dc53Title: "Настройка инструментов",
      dc53Desc: "Адаптация устройств и приложений под свои потребности.",
      dc54Title: "Непрерывное обучение",
      dc54Desc: "Постоянное освоение и обновление цифровых навыков.",
      quickActions: "Быстрые действия",
      actionTest: "Пройти тест",
      actionTestDesc:
        "Пройдите тест по цифровой грамотности и узнайте свой результат.",
      actionProfile: "Профиль",
      actionProfileDesc: "Просмотрите свои данные и результаты тестов.",
      authModalTitle: "Необходимо войти или зарегистрироваться",
      authModalDesc:
        "Войдите в систему или зарегистрируйтесь, чтобы просмотреть этот раздел.",
      authModalLogin: "Войти",
      authModalRegister: "Зарегистрироваться",
      footer: "Информационная система оценки цифровой грамотности",
    },
    profile: {
      siteName: "Оценка цифровой грамотности",
      takeTest: "Пройти тест",
      profile: "Профиль",
      logout: "Выйти",
      pageTitle: "Профиль",
      pageDesc: "Ваши данные и статистика тестов.",
      fullName: "ФИО",
      email: "Электронная почта",
      level: "Уровень",
      levelPlaceholder: "Будет установлен после прохождения тестов",
      completedTests: "Пройденные тесты",
      completedTestsCount: "тестов",
      testResultsTitle: "Результаты тестов",
      testResultsEmpty:
        "Тесты пока не пройдены. Пройдите тест, чтобы здесь отобразились результаты.",
      backTitle: "Вернуться на главную",
      backButton: "Главная",
      statLastTest: "Последний тест",
      statTotalScore: "Общий балл",
      statAverage: "Средний результат",
      statBest: "Лучший результат",
      testResultsCardTitle: "Результаты тестов",
      fullStatsTitle: "Полная статистика",
      statsAvg: "📈 Средний результат",
      statsLastActivity: "⏱️ Последняя активность",
      statsTotalScore: "💯 Общий балл",
      aiRecommendationsTitle: "🎯 Персональные рекомендации",
      aiBadge: "ИИ анализ",
      aiFooterBtn: "🤖 Полный ИИ анализ — доступно на странице теста",
      activityTitle: "История активности",
      editBtn: "✏️ Изменить",
      editModalTitle: "Редактировать профиль",
      editNameLabel: "ФИО",
      editNamePlaceholder: "Введите своё имя",
      editNewPassLabel: "Новый пароль (оставьте пустым, чтобы не менять)",
      editNewPassPlaceholder: "Новый пароль",
      editCurrentPassLabel: "Текущий пароль",
      editCurrentPassPlaceholder: "Ваш текущий пароль",
      editConfirmPassLabel: "Подтвердите новый пароль",
      editConfirmPassPlaceholder: "Повторите новый пароль",
      editSaveBtn: "Сохранить",
      editSavingBtn: "Сохранение...",
      editNameRequired: "Введите своё имя",
      editPassMismatch: "Новые пароли не совпадают",
      editSaveSuccess: "Успешно сохранено!",
      editSaveError: "Нет связи с сервером",
      authModalTitle: "Необходимо войти или зарегистрироваться",
      authModalDesc:
        "Войдите или зарегистрируйтесь, чтобы просмотреть профиль.",
      authModalLogin: "Войти",
      authModalRegister: "Зарегистрироваться",
      levelLow: "Низкий",
      levelMid: "Средний",
      levelHigh: "Высокий",
      scoreLabel: "баллов",
      retakeBtn: "Повторить →",
      startBtn: "Пройти →",
      loading: "Загрузка...",
      noActivity: "Активности пока нет",
      aiAnalysisLabel: "ИИ анализ",
      aiSaved: "Сохранено:",
      aiNewBtn: "🔄 Получить новый анализ — на странице теста",
      aiGetBtn: "🤖 Получить ИИ анализ — на странице теста",
      completedAll: "Вы завершили все блоки! Отличный результат.",
      tryRest: "Завершите оставшиеся блоки, чтобы улучшить результат.",
      dailyTip: "Если тренироваться ежедневно, результат вырастет на 30%.",
      reviewBlock: "Рекомендуем повторить блок",
      tookTest: "Прошёл тест",
      level1label: "Низкий",
      level2label: "Средний",
      level3label: "Высокий",
      moreBtn: "📋 Подробнее",
      collapseBtn: "▲ Свернуть",
      registeredLabel: "Зарегистрирован:",
    },
    test: {
      siteName: "Оценка цифровой грамотности",
      takeTest: "Пройти тест",
      profile: "Профиль",
      logout: "Выйти",
      pageTitle: "Пройти тест",
      pageSubtitle: "Определите свой уровень цифровой грамотности",
      bannerTitle: "Готовы начать тест?",
      bannerDesc:
        "Тест на основе DigComp 2.2 поможет вам определить уровень вашей цифровой грамотности.",
      bannerBtn: "Начать тест",
      digcompTitle: "DigComp 2.2 — 5 компетенций",
      digcompSub: "Тест измеряет ваши цифровые навыки в этих пяти областях",
      dc1Name: "Информационная и медиаграмотность",
      dc1Desc:
        "Измеряет навыки поиска, оценки, хранения и использования информации из интернета. Умение выявлять ложную информацию и проверять достоверность данных является основой жизни в цифровой среде.",
      dc1Tag: "Поиск · Оценка · Фильтрация",
      dc2Name: "Коммуникация и сотрудничество",
      dc2Desc:
        "Оценивает способность эффективно общаться по цифровым каналам, совместно работать и участвовать в онлайн-сообществах. Этика, кибер-культура и концепции цифрового гражданства входят в этот блок.",
      dc2Tag: "Мессенджер · Сотрудничество · Этика",
      dc3Name: "Создание цифрового контента",
      dc3Desc:
        "Измеряет навыки создания, редактирования и распространения цифрового контента: текстов, изображений, видео. Авторское право, лицензирование и основы программирования также относятся к этой компетенции.",
      dc3Tag: "Контент · Авторское право · Программирование",
      dc4Name: "Безопасность",
      dc4Desc:
        "Оценивает навыки защиты личных данных, гигиену паролей, защиту от вредоносных программ и распознавание онлайн-угроз. Охватывает вопросы личной и коллективной безопасности в цифровой среде.",
      dc4Tag: "Данные · Пароль · Фишинг",
      dc5Name: "Решение проблем",
      dc5Desc:
        "Измеряет способность самостоятельно решать технические проблемы, выбирать цифровые инструменты по назначению и адаптироваться к новым ситуациям с инновационными подходами. Критическое мышление — ключ к цифровому развитию.",
      dc5Tag: "Техника · Адаптивность · Решение",
      resultsTitle: "📊 Последние результаты",
      resultsSub: "Данные последнего теста на основе DigComp 2.2",
      aiTitle: "🤖 AI-анализ и рекомендации",
      aiSub:
        "Анализирует ваши результаты и даёт персональные советы для вашей профессии",
      aiCardTitle: "Персональный AI-анализ",
      aiCardDesc:
        "Анализирует ваши результаты по всем блокам и составляет учебный план",
      aiBtn: "Начать анализ",
      aiLoading: "ИИ анализирует...",
      aiLoadingSub: "Может занять 10–20 секунд",
      aiResultTitle: "AI-анализ",
      aiResultBadge: "Персональный",
      aiSaved: "Сохранено:",
      aiError: "Произошла ошибка. Попробуйте снова.",
      aiRetry: "Повторить",
      modalTitle: "Необходимо войти или зарегистрироваться",
      modalDesc: "Войдите или зарегистрируйтесь, чтобы начать тест.",
      modalLogin: "Войти",
      modalRegister: "Зарегистрироваться",
      emptyTitle: "Тесты ещё не пройдены",
      emptyDesc: "Нажмите кнопку выше, чтобы начать тест",
      emptyBtn: "→ Начать тест",
      loading: "Загрузка...",
      overallLabel: "Общий балл",
      blocksCompleted: "/ 5 блоков завершено",
      notTaken: "Не пройден",
      levelDesc1:
        "Необходимо развивать цифровые навыки. Совершенствовать знания можно, работая с базовыми ресурсами.",
      levelDesc2:
        "Средний уровень цифровой грамотности. Вы способны решать повседневные задачи.",
      levelDesc3:
        "Высокий уровень цифровой грамотности. Вы можете самостоятельно справляться со сложными ситуациями.",
    },
  },
};

let currentLanguage = localStorage.getItem("language") || "en";

function setLanguage(lang) {
  currentLanguage = lang;
  localStorage.setItem("language", lang);
  applyTranslations();
  if (typeof window.__testResultsRerender === "function") {
    window.__testResultsRerender();
  }
  if (typeof window.__profileRerender === "function") {
    window.__profileRerender();
  }
}

function applyTranslations() {
  let pageType = document.body.getAttribute("data-page") || "";
  if (!pageType && document.body.classList.contains("register-page"))
    pageType = "register";
  if (!pageType && document.body.classList.contains("login-page"))
    pageType = "login";
  if (!pageType && document.body.classList.contains("dashboard-page"))
    pageType = "dashboard";
  const pageTranslations = translations[currentLanguage][pageType];

  if (!pageTranslations) return;

  document.querySelectorAll("[data-translate]").forEach((element) => {
    const key = element.getAttribute("data-translate");
    if (pageTranslations[key]) {
      element.textContent = pageTranslations[key];
    }
  });

  document
    .querySelectorAll("[data-translate-placeholder]")
    .forEach((element) => {
      const key = element.getAttribute("data-translate-placeholder");
      if (pageTranslations[key]) {
        element.placeholder = pageTranslations[key];
      }
    });

  if (pageType === "login") {
    document.title =
      translations[currentLanguage].login.title + " - Modern Style";
  } else if (pageType === "register") {
    document.title =
      translations[currentLanguage].register.title + " - Modern Style";
  } else if (pageType === "dashboard") {
    document.title = translations[currentLanguage].dashboard.siteName;
  } else if (pageType === "profile") {
    document.title =
      translations[currentLanguage].profile.pageTitle +
      " — " +
      translations[currentLanguage].profile.siteName;
  } else if (pageType === "test") {
    document.title =
      translations[currentLanguage].test.pageTitle +
      " — " +
      translations[currentLanguage].test.siteName;
  }

  document.querySelectorAll(".lang-btn").forEach((btn) => {
    if (btn.getAttribute("data-lang") === currentLanguage) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });

  const labelEl = document.querySelector(".lang-dropdown-label");
  if (labelEl) labelEl.textContent = currentLanguage.toUpperCase();
  document.querySelectorAll(".lang-option").forEach((btn) => {
    if (btn.getAttribute("data-lang") === currentLanguage) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });
}

function initLangDropdown() {
  const dropdown = document.querySelector(".lang-dropdown");
  if (!dropdown) return;
  const trigger = document.getElementById("langDropdownBtn");
  const menu = document.getElementById("langDropdownMenu");
  if (!trigger || !menu) return;

  trigger.addEventListener("click", function (e) {
    e.stopPropagation();
    dropdown.classList.toggle("open");
    const open = dropdown.classList.contains("open");
    trigger.setAttribute("aria-expanded", open);
    menu.setAttribute("aria-hidden", !open);
  });

  menu.addEventListener("click", function (e) {
    e.stopPropagation();
  });

  dropdown.querySelectorAll(".lang-option").forEach((option) => {
    option.addEventListener("click", function (e) {
      e.stopPropagation();
      const lang = this.getAttribute("data-lang");
      if (lang) setLanguage(lang);
      dropdown.classList.remove("open");
      trigger.setAttribute("aria-expanded", "false");
      menu.setAttribute("aria-hidden", "true");
    });
  });

  document.addEventListener("click", function () {
    dropdown.classList.remove("open");
    trigger.setAttribute("aria-expanded", "false");
    menu.setAttribute("aria-hidden", "true");
  });
}

document.addEventListener("DOMContentLoaded", function () {
  applyTranslations();
  initLangDropdown();

  const registerForm = document.getElementById("registerForm");
  if (registerForm) {
    registerForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const password = document.getElementById("password").value;
      const confirmPassword = document.getElementById("confirmPassword").value;

      if (password !== confirmPassword) {
        alert(translations[currentLanguage].register.passwordMismatch);
        return;
      }

      console.log("Registration form submitted");
    });
  }
});
