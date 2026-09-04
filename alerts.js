/**
 * Multilingual Translations, Web Audio API Disaster Siren & Speech Synthesizer
 * Supports 8 North Eastern Regional Languages:
 * English, Hindi (हिन्दी), Assamese (অসমীয়া), Bengali (বাংলা),
 * Nepali (नेपाली), Mizo (Mizo ṭawng), Khasi (Ka Ktien Khasi), Manipuri / Meitei (মৈতৈলোন্)
 */

const I18N_DICTIONARY = {
  en: {
    header_sub: "AI Landslide Early Warning & GIS (NER)",
    siren_btn: "SIREN",
    live_alerts_badge: "LIVE ALERTS",
    gis_layers_title: "GIS Map Layers",
    layer_hazards: "Hazard Polygons & Slopes",
    layer_sensors: "IoT Sensor Stations (Telemetry)",
    layer_highways: "Highways & Road Blocks",
    layer_shelters: "Shelters & SDRF Camps",
    layer_weather_radar: "Weather: Precipitation Radar & Storm Cells",
    layer_weather_stations: "Weather: IMD Met Stations & Telemetry",
    weather_hud_live: "Live Doppler Radar & Weather",
    basemap_label: "Basemap Style:",
    corridors_label: "Focus Vulnerable Corridor:",
    risk_summary_title: "Regional Hazard Level",
    legend_title: "Hazard Severity Index",
    tab2_title: "Real-Time Telemetry & AI Early Warning",
    tab2_sub: "In-situ IoT sensors, dynamic I-D rainfall curves, and infinite slope geotechnical factor of safety.",
    refresh_btn: "Refresh Telemetry",
    ai_predictor_title: "Dynamic AI Landslide Predictor",
    lbl_slope: "Slope Angle (°):",
    lbl_rain24: "24h Rainfall (mm):",
    lbl_vwc: "Soil Moisture VWC (%):",
    lbl_pwp: "Pore Pressure (kPa):",
    lbl_velocity: "Tilt Velocity (mm/hr):",
    lbl_lithology: "Lithological Geology:",
    btn_calc_risk: "Compute Landslide Hazard Index (LHI)",
    fos_title: "Geotechnical Factor of Safety (FoS)",
    fos_desc: "Calculates slope shear strength vs driving shear stress factoring pore water pressure dynamics.",
    tab3_title: "Citizen & Field Official Incident Reporting",
    tab3_sub: "Capture ground fissures, road subsidence, and rockfall with offline IndexedDB queue sync.",
    lbl_name: "Reporter Name:",
    lbl_state: "State:",
    lbl_location: "Location / Landmark / Highway KM:",
    btn_gps: "Grab GPS",
    fissure_heading: "Fissure & Ground Displacement Parameters",
    lbl_crack_type: "Crack Morphology Type:",
    lbl_crack_w: "Crack Width (mm):",
    lbl_crack_d: "Crack Depth (cm):",
    lbl_crack_l: "Length Along Slope (m):",
    lbl_subsidence: "Road Subsidence (cm):",
    lbl_photo: "Capture / Upload Fissure Photo:",
    lbl_notes: "Observations / Sound of Water / Falling Stones:",
    btn_submit_report: "Submit Incident Report (Auto Offline Cache)",
    offline_queue_title: "Offline Storage Queue (IndexedDB)",
    offline_queue_desc: "Reports submitted without internet connectivity are securely stored in your browser and automatically sync when connection returns.",
    no_queued_reports: "No offline reports pending synchronization.",
    btn_sync_now: "Force Sync Offline Reports",
    tab4_title: "DDMA / SDMA Emergency Command Dashboard",
    tab4_sub: "District disaster coordination, rainfall cloudburst stress-testing, and automated warning broadcast.",
    sim_title: "Monsoon Cloudburst & Deluge Stress Simulator",
    sim_desc: "Simulate extreme localized precipitation surge (+25mm to +200mm in 24h) to analyze cascading highway failures, threshold breaches, and village evacuation triggers.",
    triage_title: "Field Incident Triage",
    broadcast_title: "Multi-Channel Disaster Broadcast",
    lbl_b_state: "Target State / District:",
    lbl_b_severity: "Warning Severity Level:",
    lbl_b_msg: "Broadcast Warning Advisory:",
    btn_dispatch_broadcast: "Dispatch Warning Broadcast",
    tab5_title: "1-Tap SOS Beacon & Evacuation Route Finder",
    tab5_sub: "Emergency distress beacon, offline SMS generator with GPS coordinates, and route pathfinder.",
    sos_touch_text: "TAP TO ACTIVATE DISTRESS",
    evac_route_title: "Safe Evacuation Route Pathfinder",
    evac_desc: "Calculates safest road route to the nearest relief shelter avoiding blocked highways.",
    btn_calc_evac: "Find Safe Route",
    hotlines_title: "24/7 State Emergency Operation Centers (SEOC)",
    guide_main_title: "Critical Situation Survival Guide & Safety Instructions",
    guide_tag: "LIFE-SAVING PROTOCOLS",
    guide_desc: "Authoritative emergency drills and survival techniques for Himalayan/Northeastern landslides and cloudbursts.",
    nav_map: "GIS Map",
    nav_early_warning: "Early Warning",
    nav_field_report: "Field Report",
    nav_ddma: "DDMA Ops",
    nav_sos: "SOS & Safety",
    modal_siren_title: "DISASTER WARNING SIREN ACTIVE",
    modal_siren_desc: "High-decibel emergency synthesizer active. Voice advisory broadcasting in selected regional language.",
    voice_lang_label: "Voice Language:",
    btn_stop_siren: "MUTE & STOP SIREN"
  },
  hi: {
    header_sub: "पूर्वोत्तर क्षेत्र भूस्खलन पूर्व चेतावनी एवं जीआईएस प्रणाली",
    siren_btn: "सायरन",
    live_alerts_badge: "ताज़ा चेतावनियाँ",
    gis_layers_title: "जीआईएस मानचित्र परतें",
    layer_hazards: "भूस्खलन खतरे के क्षेत्र एवं ढलान",
    layer_sensors: "आईओटी सेंसर स्टेशन (टेलीमेट्री)",
    layer_highways: "राजमार्ग एवं सड़क अवरोध",
    layer_shelters: "राहत शिविर एवं एसडीआरएफ कैंप",
    layer_weather_radar: "मौसम: वर्षा रडार एवं तूफान कोशिकाएं",
    layer_weather_stations: "मौसम: आईएमडी मौसम केंद्र एवं टेलीमेट्री",
    weather_hud_live: "लाइव डॉपलर रडार एवं मौसम",
    basemap_label: "मानचित्र शैली:",
    corridors_label: "संवेदनशील मार्ग चुनें:",
    risk_summary_title: "क्षेत्रीय आपदा स्तर",
    legend_title: "भूस्खलन खतरा सूचकांक",
    tab2_title: "वास्तविक समय टेलीमेट्री एवं पूर्व चेतावनी",
    tab2_sub: "आईओटी सेंसर, वर्षा थ्रेशोल्ड वक्र, और भू-तकनीकी सुरक्षा कारक (FoS)।",
    refresh_btn: "टेलीमेट्री रीफ्रेश करें",
    ai_predictor_title: "एआई भूस्खलन जोखिम मॉडल",
    lbl_slope: "ढलान कोण (°):",
    lbl_rain24: "२४ घंटे वर्षा (मिमी):",
    lbl_vwc: "मिट्टी की नमी (%):",
    lbl_pwp: "पोर वाटर प्रेशर (kPa):",
    lbl_velocity: "झुकाव गति (मिमी/घंटा):",
    lbl_lithology: "चट्टान का प्रकार:",
    btn_calc_risk: "भूस्खलन सूचकांक (LHI) की गणना करें",
    fos_title: "भू-तकनीकी सुरक्षा कारक (FoS)",
    fos_desc: "ढलान की स्थिरता एवं अपरूपण क्षमता का वास्तविक समय विश्लेषण।",
    tab3_title: "फील्ड घटना एवं दरार रिपोर्टिंग",
    tab3_sub: "ऑफ़लाइन मोड में दरारों और सड़क धंसने की रिपोर्ट दर्ज करें।",
    lbl_name: "रिपोर्टर का नाम:",
    lbl_state: "राज्य:",
    lbl_location: "स्थान / हाईवे किमी:",
    btn_gps: "जीपीएस प्राप्त करें",
    fissure_heading: "दरार एवं विस्थापन माप",
    lbl_crack_type: "दरार का प्रकार:",
    lbl_crack_w: "दरार की चौड़ाई (मिमी):",
    lbl_crack_d: "दरार की गहराई (सेमी):",
    lbl_crack_l: "ढलान पर लंबाई (मीटर):",
    lbl_subsidence: "सड़क का धंसाव (सेमी):",
    lbl_photo: "दरार की फोटो अपलोड करें:",
    lbl_notes: "टिप्पणी / गिरते पत्थर / पानी का रिसाव:",
    btn_submit_report: "रिपोर्ट सबमिट करें (ऑफ़लाइन सुरक्षित)",
    offline_queue_title: "ऑफ़लाइन स्टोरेज कतार (IndexedDB)",
    offline_queue_desc: "इंटरनेट न होने पर रिपोर्ट आपके ब्राउज़र में सुरक्षित रहेगी और नेटवर्क आने पर अपने आप सिंक हो जाएगी।",
    no_queued_reports: "कोई ऑफ़लाइन रिपोर्ट लंबित नहीं है।",
    btn_sync_now: "ऑफ़लाइन रिपोर्ट सिंक करें",
    tab4_title: "डीडीएमए आपदा नियंत्रण कक्ष",
    tab4_sub: "जिला आपदा समन्वय, अत्यधिक वर्षा सिमुलेशन और चेतावनी प्रसारण।",
    sim_title: "भारी बारिश / बादल फटने का सिमुलेटर",
    sim_desc: "अचानक होने वाली भीषण बारिश के प्रभाव और सड़क अवरोधों का पूर्व-परीक्षण करें।",
    triage_title: "फील्ड रिपोर्ट जांच सूची",
    broadcast_title: "आपातकालीन चेतावनी प्रसारण",
    lbl_b_state: "लक्षित राज्य / जिला:",
    lbl_b_severity: "चेतावनी स्तर:",
    lbl_b_msg: "चेतावनी संदेश:",
    btn_dispatch_broadcast: "चेतावनी प्रसारित करें",
    tab5_title: "1-टैप एसओएस और सुरक्षित निकासी मार्ग",
    tab5_sub: "तत्काल आपातकालीन संकेत, जीपीएस युक्त एसएमएस और सुरक्षित आश्रय मार्ग।",
    sos_touch_text: "आपातकालीन सहायता हेतु स्पर्श करें",
    evac_route_title: "सुरक्षित निकासी मार्ग खोजक",
    evac_desc: "अवरुद्ध राजमार्गों से बचते हुए निकटतम राहत शिविर का सुरक्षित मार्ग।",
    btn_calc_evac: "सुरक्षित मार्ग खोजें",
    hotlines_title: "२४/७ राज्य आपदा नियंत्रण कक्ष (SEOC)",
    guide_main_title: "आपातकालीन जीवन रक्षा मार्गदर्शिका एवं सुरक्षा निर्देश",
    guide_tag: "जीवन रक्षक नियम",
    guide_desc: "भूस्खलन और भारी बारिश के दौरान स्वयं एवं परिवार की सुरक्षा के महत्वपूर्ण निर्देश।",
    nav_map: "जीआईएस मैप",
    nav_early_warning: "पूर्व चेतावनी",
    nav_field_report: "फील्ड रिपोर्ट",
    nav_ddma: "डीडीएमए कक्ष",
    nav_sos: "एसओएस सहायता",
    modal_siren_title: "आपदा चेतावनी सायरन सक्रिय",
    modal_siren_desc: "उच्च तीव्रता वाला आपातकालीन सायरन और क्षेत्रीय भाषा में वॉयस अलर्ट बज रहा है।",
    voice_lang_label: "आवाज की भाषा:",
    btn_stop_siren: "सायरन बंद करें"
  },
  as: {
    header_sub: "উত্তৰ-পূব অঞ্চলৰ ভূমিস্খলন পূৰ্ব সতৰ্কীকৰণ আৰু জিআইএছ প্লেটফৰ্ম",
    siren_btn: "চাইৰেন",
    live_alerts_badge: "সক্ৰিয় সতৰ্কবাণী",
    gis_layers_title: "জিআইএছ মেপ স্তৰসমূহ",
    layer_hazards: "ভূমিস্খলন বিপদ এলেকা",
    layer_sensors: "আইঅ'টি ছেনচৰ ষ্টেচন",
    layer_highways: "ৰাষ্ট্ৰীয় ঘাইপথ আৰু অৱৰোধ",
    layer_shelters: "আশ্ৰয় শিবিৰ আৰু এছডিআৰএফ",
    layer_weather_radar: "বতৰ: বৰষুণ ৰাডাৰ আৰু ধুমুহাৰ তথ্য",
    layer_weather_stations: "বতৰ: আইএমডি বতৰ কেন্দ্ৰ আৰু টেলিমেট্ৰি",
    weather_hud_live: "লাইভ ডপলাৰ ৰাডাৰ আৰু বতৰ",
    basemap_label: "মেপ শৈলী:",
    corridors_label: "সংবেদনশীল পথ নিৰ্বাচন:",
    risk_summary_title: "আঞ্চলিক বিপদৰ মাত্ৰা",
    legend_title: "বিপদ সূচক",
    tab2_title: "প্ৰত্যক্ষ সময়ৰ টেলিমেট্ৰী আৰু সতৰ্কবাণী",
    tab2_sub: "আইঅ'টি ছেনচৰ, বৰষুণৰ পৰিমাণ আৰু ভূ-কাৰিকৰী সুৰক্ষা নিৰ্ণয়।",
    refresh_btn: "আপডেট কৰক",
    ai_predictor_title: "এআই ভূমিস্খলন ভৱিষ্যদ্বাণী",
    lbl_slope: "ঢালৰ কোণ (°):",
    lbl_rain24: "২৪ ঘণ্টাৰ বৰষুণ (মিমি):",
    lbl_vwc: "মাটিৰ আৰ্দ্ৰতা (%):",
    lbl_pwp: "ছিদ্ৰ পানীৰ চাপ (kPa):",
    lbl_velocity: "স্থানান্তৰৰ গতি (মিমি/ঘণ্টা):",
    lbl_lithology: "শিলা আৰু ভূতত্ত্ব:",
    btn_calc_risk: "বিপদ সূচক (LHI) গণনা কৰক",
    fos_title: "সুৰক্ষা কাৰক (Factor of Safety)",
    fos_desc: "পানীৰ চাপ আৰু ঢালৰ স্থিৰতাৰ কাৰিকৰী বিশ্লেষণ।",
    tab3_title: "ক্ষেত্ৰ প্ৰতিবেদন আৰু ফাটৰ তথ্য",
    tab3_sub: "ইণ্টাৰনেট নোহোৱাকৈ অফলাইন মোডতো ফাট আৰু ভূমিস্খলনৰ তথ্য জমা দিয়ক।",
    lbl_name: "প্ৰতিবেদকৰ নাম:",
    lbl_state: "ৰাজ্য:",
    lbl_location: "স্থান / ঘাইপথৰ নাম:",
    btn_gps: "জিপিএছ লওক",
    fissure_heading: "ফাট আৰু মাটিৰ স্খলনৰ মাত্ৰা",
    lbl_crack_type: "ফাটৰ প্ৰকাৰ:",
    lbl_crack_w: "ফাটৰ প্ৰস্থ (মিমি):",
    lbl_crack_d: "ফাটৰ গভীৰতা (চেমি):",
    lbl_crack_l: "দৈৰ্ঘ্য (মিটাৰ):",
    lbl_subsidence: "পথ বহি যোৱা (চেমি):",
    lbl_photo: "ফাটৰ ফটো তোলক:",
    lbl_notes: "মন্তব্য / শিল খহি পৰা ইত্যাদি:",
    btn_submit_report: "প্ৰতিবেদন জমা দিয়ক (অফলাইন সংৰক্ষণ)",
    offline_queue_title: "অফলাইন সংৰক্ষণ কিউ",
    offline_queue_desc: "নেটৱৰ্ক নথকা সময়ত তথ্য সংৰক্ষিত হ'ব আৰু ইণ্টাৰনেট পোৱাৰ লগে লগে ছাৰ্ভাৰলৈ প্ৰেৰণ হ'ব।",
    no_queued_reports: "কোনো অফলাইন তথ্য বাকী নাই।",
    btn_sync_now: "এতিয়াই চিংক কৰক",
    tab4_title: "জিলা দুৰ্যোগ ব্যৱস্থাপনা কক্ষ",
    tab4_sub: "দুৰ্যোগ সমন্বয়, ধাৰাসাৰ বৰষুণৰ পৰীক্ষণ আৰু জৰুৰী সতৰ্কবাণী প্ৰচাৰ।",
    sim_title: "ডাৱৰ বিস্ফোৰণ আৰু বৰষুণ চিমুলেটৰ",
    sim_desc: "অতিপাত বৰষুণৰ ফলত হ'ব পৰা স্খলন আৰু পথ অৱৰোধৰ আগতীয়া পৰীক্ষা।",
    triage_title: "ফিল্ড প্ৰতিবেদন পৰ্যালোচনা",
    broadcast_title: "জৰুৰীকালীন সতৰ্কবাণী প্ৰেৰণ",
    lbl_b_state: "লক্ষ্য ৰাজ্য / জিলা:",
    lbl_b_severity: "সতৰ্কবাণীৰ স্তৰ:",
    lbl_b_msg: "বাৰ্তাৰ বিৱৰণ:",
    btn_dispatch_broadcast: "সতৰ্কবাণী সম্প্ৰচাৰ কৰক",
    tab5_title: "১-টেপ এছঅ'এছ আৰু সুৰক্ষিত স্থানান্তৰ পথ",
    tab5_sub: "জিপিএছ সমন্বিতে জৰুৰী বাৰ্তা আৰু নিৰাপদ আশ্ৰয় শিবিৰৰ পথ।",
    sos_touch_text: "জৰুৰী সহায়ৰ বাবে স্পৰ্শ কৰক",
    evac_route_title: "নিৰাপদ স্থানান্তৰ পথ নিৰ্ধাৰক",
    evac_desc: "বন্ধ ঘাইপথ এৰাই নিকটৱৰ্তী আশ্ৰয় শিবিৰলৈ যোৱাৰ সুৰক্ষিত পথ।",
    btn_calc_evac: "পথ সন্ধান কৰক",
    hotlines_title: "২৪/৭ ৰাজ্যিক দুৰ্যোগ হেল্পলাইন",
    guide_main_title: "সংকটকালীন জীৱন ৰক্ষা আৰু সুৰক্ষা নিৰ্দেশনা",
    guide_tag: "জীৱন ৰক্ষাকাৰী নিয়ম",
    guide_desc: "ভূমিস্খলনৰ সময়ত তাৎক্ষণিক সুৰক্ষা আৰু আত্মৰক্ষাৰ প্ৰয়োজনীয় নিৰ্দেশ।",
    nav_map: "জিআইএছ মেপ",
    nav_early_warning: "পূৰ্ব সতৰ্কবাণী",
    nav_field_report: "ফিল্ড ৰিপৰ্ট",
    nav_ddma: "ডিডিএমএ",
    nav_sos: "এছঅ'এছ",
    modal_siren_title: "দুৰ্যোগ সতৰ্কবাণী চাইৰেন সক্ৰিয়",
    modal_siren_desc: "উচ্চ ক্ষমতাসম্পন্ন জৰুৰীকালীন চাইৰেন আৰু স্থানীয় ভাষাৰ ধ্বনি সংকেত বাজি আছে।",
    voice_lang_label: "মাতৰ ভাষা:",
    btn_stop_siren: "চাইৰেন বন্ধ কৰক"
  },
  bn: {
    header_sub: "উত্তর-পূর্ব অঞ্চল ভূমিধস আগাম সতর্কতা ও জিআইএস",
    siren_btn: "সাইরেন",
    live_alerts_badge: "লাইভ সতর্কতা",
    gis_layers_title: "জিআইএস মানচিত্র স্তর",
    layer_hazards: "ভূমিধস প্রবণ এলাকা",
    layer_sensors: "আইওটি সেন্সর স্টেশন",
    layer_highways: "মহাসড়ক ও রাস্তা অবরোধ",
    layer_shelters: "আশ্রয় কেন্দ্র ও এসডিআরএফ",
    layer_weather_radar: "আবহাওয়া: বৃষ্টি রাডার ও ঝড় সতর্কতা",
    layer_weather_stations: "আবহাওয়া: আইএমডি আবহাওয়া স্টেশন ও টেলিমেট্রি",
    weather_hud_live: "লাইভ ডপলার রাডার ও আবহাওয়া",
    basemap_label: "মানচিত্রের ধরন:",
    corridors_label: "গুরুত্বপূর্ণ করিডোর:",
    risk_summary_title: "আঞ্চলিক বিপদের মাত্রা",
    legend_title: "বিপদ সূচক",
    tab2_title: "লাইভ টেলিমেট্রি ও আগাম সতর্কতা",
    tab2_sub: "আইওটি সেন্সর, বৃষ্টির মাত্রা ও ঢাল স্থায়িত্ব বিশ্লেষণ।",
    refresh_btn: "রিফ্রেশ করুন",
    ai_predictor_title: "এআই ভূমিধস পূর্বাভাস মডেল",
    lbl_slope: "ঢালের কোণ (°):",
    lbl_rain24: "২৪ ঘণ্টার বৃষ্টি (মিমি):",
    lbl_vwc: "মাটির আর্দ্রতা (%):",
    lbl_pwp: "ছিদ্র জলের চাপ (kPa):",
    lbl_velocity: "স্থানচ্যুতির গতি (মিমি/ঘণ্টা):",
    lbl_lithology: "শিলা বিন্যাস:",
    btn_calc_risk: "বিপদ সূচক (LHI) নির্ণয় করুন",
    fos_title: "ভূতাত্ত্বিক নিরাপত্তা গুণক (FoS)",
    fos_desc: "ঢালের স্থায়িত্ব ও চাপের বৈজ্ঞানিক হিসাব।",
    tab3_title: "মাঠ পর্যায়ের ফাটল ও ক্ষয়ক্ষতি রিপোর্ট",
    tab3_sub: "অফলাইনেও ফাটল ও রাস্তা ধসের তথ্য নিরাপদে সংরক্ষণ করুন।",
    lbl_name: "প্রতিবেদকের নাম:",
    lbl_state: "রাজ্য:",
    lbl_location: "স্থান / হাইওয়ে কিমি:",
    btn_gps: "জিপিএস নিন",
    fissure_heading: "মাটির ফাটলের পরিমাপ",
    lbl_crack_type: "ফাটলের ধরন:",
    lbl_crack_w: "ফাটলের প্রস্থ (মিমি):",
    lbl_crack_d: "ফাটলের গভীরতা (সেমি):",
    lbl_crack_l: "দৈর্ঘ্য (মিটার):",
    lbl_subsidence: "রাস্তা বসে যাওয়া (সেমি):",
    lbl_photo: "ফাটলের ছবি আপলোড:",
    lbl_notes: "পর্যবেক্ষণ / জলের নির্গমন:",
    btn_submit_report: "রিপোর্ট জমা দিন (অফলাইন মোড)",
    offline_queue_title: "অফলাইন স্টোরেজ কিউ",
    offline_queue_desc: "ইন্টারনেট না থাকলেও তথ্য জমা থাকবে এবং সংযোগ পেলে স্বয়ংক্রিয়ভাবে সিঙ্ক হবে।",
    no_queued_reports: "কোনো অফলাইন রিপোর্ট বাকি নেই।",
    btn_sync_now: "এখনই সিঙ্ক করুন",
    tab4_title: "জেলা দুর্যোগ ব্যবস্থাপনা ড্যাশবোর্ড",
    tab4_sub: "দুর্যোগ সমন্বয়, মেঘভাঙা বৃষ্টির প্রভাব পরীক্ষা ও জরুরি বার্তা।",
    sim_title: "ভারী বৃষ্টিপাত ও মেঘভাঙা সিমুলেটর",
    sim_desc: "অতিরিক্ত বৃষ্টির ফলে রাস্তা অবরোধ ও সম্ভাব্য ধসের সিমুলেশন।",
    triage_title: "রিপোর্ট যাচাই তালিকা",
    broadcast_title: "জরুরি সম্প্রচার বার্তা",
    lbl_b_state: "টার্গেট রাজ্য / জেলা:",
    lbl_b_severity: "সতর্কতার মাত্রা:",
    lbl_b_msg: "সতর্কবার্তা:",
    btn_dispatch_broadcast: "সতর্কবার্তা পাঠান",
    tab5_title: "১-ট্যাপ এসওএস ও নিরাপদ উদ্ধার পথ",
    tab5_sub: "জরুরি বিপদ সংকেত, জিপিএস ভিত্তিক বার্তা ও নিরাপদ আশ্রয়ের পথ।",
    sos_touch_text: "জরুরি সহায়তার জন্য স্পর্শ করুন",
    evac_route_title: "নিরাপদ উদ্ধার পথ নির্দেশক",
    evac_desc: "বিপদ এড়িয়ে নিকটবর্তী আশ্রয়কেন্দ্রে পৌঁছানোর নিরাপদ রুট।",
    btn_calc_evac: "নিরাপদ পথ খুঁজুন",
    hotlines_title: "২৪/৭ রাজ্য দুর্যোগ হেল্পলাইন",
    guide_main_title: "জরুরি জীবনরক্ষা নির্দেশিকা ও নিরাপত্তা গাইড",
    guide_tag: "জীবন রক্ষাকারী নিয়ম",
    guide_desc: "ভূমিধস ও মেঘভাঙা বৃষ্টির সময় আত্মরক্ষা ও জরুরি সতর্কতার উপায়।",
    nav_map: "জিআইএস ম্যাপ",
    nav_early_warning: "আগাম সতর্কতা",
    nav_field_report: "ফিল্ড রিপোর্ট",
    nav_ddma: "ডিডিএমএ",
    nav_sos: "এসওএস",
    modal_siren_title: "দুর্যোগ সতর্কতা সাইরেন চালু",
    modal_siren_desc: "উচ্চ শব্দে জরুরি সাইরেন ও আঞ্চলিক ভাষায় সতর্কবার্তা বাজছে।",
    voice_lang_label: "ভয়েস ভাষা:",
    btn_stop_siren: "সাইরেন বন্ধ করুন"
  },
  ne: {
    header_sub: "पूर्वोत्तर क्षेत्र पहिरो पूर्व चेतावनी तथा जीआईएस प्रणाली",
    siren_btn: "साइरन",
    live_alerts_badge: "प्रत्यक्ष चेतावनी",
    gis_layers_title: "जीआईएस नक्सा तहहरू",
    layer_hazards: "पहिरो जोखिम क्षेत्र तथा भिरालोपन",
    layer_sensors: "आईओटी सेन्सर स्टेशनहरू",
    layer_highways: "राजमार्ग तथा सडक अवरोध",
    layer_shelters: "राहत शिविर तथा एसडीआरएफ क्याम्प",
    layer_weather_radar: "मौसम: वर्षा रडार र आँधी सेलहरू",
    layer_weather_stations: "मौसम: आईएमडी मौसम स्टेशन र टेलिमेट्री",
    weather_hud_live: "प्रत्यक्ष डपलर रडार र मौसम",
    basemap_label: "नक्सा शैली:",
    corridors_label: "जोखिम मार्ग छनोट:",
    risk_summary_title: "क्षेत्रीय जोखिम स्तर",
    legend_title: "पहिरो जोखिम सूचकांक",
    tab2_title: "प्रत्यक्ष टेलिमेट्री र पूर्व चेतावनी",
    tab2_sub: "आईओटी सेन्सर, वर्षा थ्रेसहोल्ड र ढलान सुरक्षा विश्लेषण।",
    refresh_btn: "रिफ्रेस गर्नुहोस्",
    ai_predictor_title: "एआई पहिरो पूर्वानुमान मोडेल",
    lbl_slope: "ढलान कोण (°):",
    lbl_rain24: "२४ घण्टाको वर्षा (मिमी):",
    lbl_vwc: "माटोको ओसिलोपन (%):",
    lbl_pwp: "छिद्र पानीको चाप (kPa):",
    lbl_velocity: "सर्नुको गति (मिमी/घण्टा):",
    lbl_lithology: "चट्टानको प्रकार:",
    btn_calc_risk: "जोखिम सूचकांक (LHI) गणना गर्नुहोस्",
    fos_title: "भू-प्राविधिक सुरक्षा कारक (FoS)",
    fos_desc: "ढलानको स्थिरता र दबाबको प्राविधिक विश्लेषण।",
    tab3_title: "फिल्ड घटना तथा चिरा रिपोर्टिङ",
    tab3_sub: "इन्टरनेट नभएको बेला पनि जमिनको चिरा र सडक भासिएको विवरण सुरक्षित गर्नुहोस्।",
    lbl_name: "रिपोर्टरको नाम:",
    lbl_state: "राज्य:",
    lbl_location: "स्थान / राजमार्ग किमी:",
    btn_gps: "जीपीएस लिनुहोस्",
    fissure_heading: "जमिनको चिराको नाप",
    lbl_crack_type: "चिराको प्रकार:",
    lbl_crack_w: "चिराको चौडाइ (मिमी):",
    lbl_crack_d: "चिराको गहिराइ (सेमी):",
    lbl_crack_l: "लम्बाइ (मिटर):",
    lbl_subsidence: "सडक भासिएको (सेमी):",
    lbl_photo: "चिराको फोटो अपलोड गर्नुहोस्:",
    lbl_notes: "टिप्पणी / ढुङ्गा झरेको विवरण:",
    btn_submit_report: "रिपोर्ट पेश गर्नुहोस् (अफलाइन सुरक्षित)",
    offline_queue_title: "अफलाइन भण्डारण सूची",
    offline_queue_desc: "इन्टरनेट नहुँदा पनि विवरण ब्राउजरमा सुरक्षित रहनेछ र नेटवर्क आउनासाथ सिङ्क हुनेछ।",
    no_queued_reports: "कुनै अफलाइन रिपोर्ट बाँकी छैन।",
    btn_sync_now: "अहिले सिङ्क गर्नुहोस्",
    tab4_title: "जिल्ला विपद् व्यवस्थापन नियन्त्रण कक्ष",
    tab4_sub: "विपद् समन्वय, भारी वर्षाको असर परीक्षण र चेतावनी प्रसारण।",
    sim_title: "मुसलधारे वर्षा सिमुलेटर",
    sim_desc: "अचानक हुने भीषण वर्षाबाट हुने सडक अवरोध र पहिरोको अग्रिम परीक्षण।",
    triage_title: "फिल्ड रिपोर्ट सूची",
    broadcast_title: "आपतकालीन चेतावनी प्रसारण",
    lbl_b_state: "लक्षित राज्य / जिल्ला:",
    lbl_b_severity: "चेतावनी स्तर:",
    lbl_b_msg: "चेतावनी सन्देश:",
    btn_dispatch_broadcast: "चेतावनी पठाउनुहोस्",
    tab5_title: "१-ट्याप एसओएस र सुरक्षित निकास मार्ग",
    tab5_sub: "आपतकालीन संकेत, जीपीएस सन्देश र सुरक्षित आश्रय मार्ग।",
    sos_touch_text: "आपतकालीन मद्दतका लागि छुनुहोस्",
    evac_route_title: "सुरक्षित निकास मार्ग खोजक",
    evac_desc: "अवरुद्ध राजमार्गहरू छलेर नजिकको सुरक्षित आश्रयमा पुग्ने मार्ग।",
    btn_calc_evac: "सुरक्षित मार्ग खोज्नुहोस्",
    hotlines_title: "२४/७ राज्य आपतकालीन हेल्पलाइन",
    guide_main_title: "आपतकालीन जीवन रक्षा गाइड तथा सुरक्षा निर्देशनहरू",
    guide_tag: "जीवन रक्षक उपायहरू",
    guide_desc: "पहिरो र विपद्को समयमा सुरक्षित रहन अपनाउनुपर्ने महत्त्वपूर्ण उपायहरू।",
    nav_map: "जीआईएस नक्सा",
    nav_early_warning: "पूर्व चेतावनी",
    nav_field_report: "फिल्ड रिपोर्ट",
    nav_ddma: "डीडीएमए",
    nav_sos: "एसओएस",
    modal_siren_title: "विपद् चेतावनी साइरन सक्रिय",
    modal_siren_desc: "आपतकालीन साइरन र स्थानीय भाषामा आवाज चेतावनी बजिरहेको छ।",
    voice_lang_label: "आवाज भाषा:",
    btn_stop_siren: "साइरन बन्द गर्नुहोस्"
  },
  mzo: {
    header_sub: "North East Region Leimin Hriattirna & GIS Platform",
    siren_btn: "SIREN",
    live_alerts_badge: "HRIATTIRNA",
    gis_layers_title: "GIS Map Layers",
    layer_hazards: "Leimin Hlauhawm Huam Chin",
    layer_sensors: "IoT Sensor Station Te",
    layer_highways: "Kawngpui & Kawng Ping",
    layer_shelters: "Bihrukna Hmun & SDRF",
    layer_weather_radar: "Khawchin: Ruahtui Radar leh Thlipui Hmun",
    layer_weather_stations: "Khawchin: IMD Khawchin Hmun leh Telemetry",
    weather_hud_live: "Live Doppler Radar leh Khawchin",
    basemap_label: "Map Chi Hrang:",
    corridors_label: "Kawng Hlauhawm:",
    risk_summary_title: "Hlauhawm Dinhmun",
    legend_title: "Hlauhawm Tehna",
    tab2_title: "Real-Time Telemetry & Hriattirna",
    tab2_sub: "Sensor te, ruah sur zat leh leilung ngheh dan enfiahna.",
    refresh_btn: "Thar thawh rawh",
    ai_predictor_title: "AI Leimin Hlauhawm Chhutna",
    lbl_slope: "Chhengchhe Zawng (°):",
    lbl_rain24: "Darkar 24 Ruah Sur (mm):",
    lbl_vwc: "Lei Hnawng Zat (%):",
    lbl_pwp: "Tui Nawr Nat Zawng (kPa):",
    lbl_velocity: "Tawlh Chak Zawng (mm/hr):",
    lbl_lithology: "Lung & Leilung Chi:",
    btn_calc_risk: "Hlauhawm Zat Chhutna",
    fos_title: "Leilung Ngheh Dan (FoS)",
    fos_desc: "Tui luh hnua leilung tawlh theih dan chhutna.",
    tab3_title: "Field Report & Lei Khi",
    tab3_sub: "Internet awm loh pawn leilung khi leh kawng chhe zual thawn theih a ni.",
    lbl_name: "Hming:",
    lbl_state: "State:",
    lbl_location: "Hmun / Kawng KM:",
    btn_gps: "GPS Lakna",
    fissure_heading: "Lei Khi & Tawlh Dan",
    lbl_crack_type: "Khi Dan Chi:",
    lbl_crack_w: "Kau Zawng (mm):",
    lbl_crack_d: "Thuk Zawng (cm):",
    lbl_crack_l: "Sei Zawng (m):",
    lbl_subsidence: "Kawng Chim (cm):",
    lbl_photo: "Thlalak Dahna:",
    lbl_notes: "Thil Hmuh Dan / Tui Khur:",
    btn_submit_report: "Report Thehluhna (Offline Save)",
    offline_queue_title: "Offline Report Khawlkhawm",
    offline_queue_desc: "Network awm loh pawn a in-save a, internet awm veleh a in-sync ang.",
    no_queued_reports: "Offline report thawn loh a awm rih lo.",
    btn_sync_now: "Sync Nghal Rawh",
    tab4_title: "DDMA / SDMA Disaster Control Room",
    tab4_sub: "Disaster buaipui, ruah sur nasa chhut lawk leh mipuite hriattirna.",
    sim_title: "Ruahpui Sur Nasat Dan Enchhinna",
    sim_desc: "Ruahpui sur thut vanga kawng ping leh leimin thleng thei endikna.",
    triage_title: "Report Enletna",
    broadcast_title: "Hriattirna Thawn Chhuah",
    lbl_b_state: "State / District:",
    lbl_b_severity: "Hlauhawm Level:",
    lbl_b_msg: "Hriattirna Thu:",
    btn_dispatch_broadcast: "Hriattirna Thawn Rawh",
    tab5_title: "1-Tap SOS & Hmun Him Panna Kawng",
    tab5_sub: "Mangang auhna, GPS nena SMS thawn leh hmun him panna kawng.",
    sos_touch_text: "MANGANG CHUAN HMET RAWH",
    evac_route_title: "Hmun Him Panna Kawng",
    evac_desc: "Kawng ping pumpelh chunga bihrukna hmun him ber pan theih dan.",
    btn_calc_evac: "Kawng Him Zawng Rawh",
    hotlines_title: "24/7 Helpline Number Te",
    guide_main_title: "Leimin Hlauhawm Chhanchhuah & Inven Dan Guide",
    guide_tag: "NUNNA CHHANCHHUAHNA",
    guide_desc: "Leimin liantham thlen laia mahni leh chhungte inven him dan zirna.",
    nav_map: "GIS Map",
    nav_early_warning: "Hriattirna",
    nav_field_report: "Field Report",
    nav_ddma: "DDMA Room",
    nav_sos: "SOS",
    modal_siren_title: "DISASTER SIREN A RI E",
    modal_siren_desc: "Emergency siren leh tawng hrang hranga hriattirna a kal mek e.",
    voice_lang_label: "Tawng:",
    btn_stop_siren: "SIREN TIHTAWPNA"
  },
  kha: {
    header_sub: "Ka Jingmaham Khyndew Shlei & GIS Platform (NER)",
    siren_btn: "SIREN",
    live_alerts_badge: "JINGMAHAM",
    gis_layers_title: "GIS Map Layers",
    layer_hazards: "Ki Jaka ba Ma ban Twid",
    layer_sensors: "Ki Sensor ba Buh ha Ri-lum",
    layer_highways: "Ki Surok & Jingkhang Surok",
    layer_shelters: "Ki Jaka ba Shngain & SDRF",
    layer_weather_radar: "Ka Jinglong Ka Suinbneng: Radar Slap & Eriong",
    layer_weather_stations: "Ka Jinglong Ka Suinbneng: IMD Met Station",
    weather_hud_live: "Live Doppler Radar bad Ka Suinbneng",
    basemap_label: "Rukom Peit Map:",
    corridors_label: "Ki Surok ba Ma:",
    risk_summary_title: "Ka kyrdan Jingma",
    legend_title: "Khyndew Shlei Index",
    tab2_title: "Ka Jingmaham & Sensor Live",
    tab2_sub: "Ki sensor, ka jingjur u slap bad ka jingshngain ka ri-lum.",
    refresh_btn: "Pynbha thymmai",
    ai_predictor_title: "AI ba ai jingmaham khyndew shlei",
    lbl_slope: "Ka jingchheng (°):",
    lbl_rain24: "U slap 24 Kynta (mm):",
    lbl_vwc: "Ka jingsngem ka khyndew (%):",
    lbl_pwp: "Ka jingkhñiot ka um (kPa):",
    lbl_velocity: "Jingkhih ka khyndew (mm/hr):",
    lbl_lithology: "Ka jait maw & khyndew:",
    btn_calc_risk: "Khein ia ka Jingma",
    fos_title: "Factor of Safety (FoS)",
    fos_desc: "Ka jingkhein bniah ia ka jingshngain u lum.",
    tab3_title: "Ka Ripot na Madan",
    tab3_sub: "Phah ripot wat lada ym don internet (Offline Mode).",
    lbl_name: "Kyrteng:",
    lbl_state: "State:",
    lbl_location: "Ka Jaka / Surok KM:",
    btn_gps: "Shim GPS",
    fissure_heading: "Ka Jingpait & Jingkhyllem",
    lbl_crack_type: "Jait Jingpait:",
    lbl_crack_w: "Jingheh ka Jingpait (mm):",
    lbl_crack_d: "Jingtympung (cm):",
    lbl_crack_l: "Jingjngai (m):",
    lbl_subsidence: "Jingtwa ka Surok (cm):",
    lbl_photo: "Shondur ia ka Jingpait:",
    lbl_notes: "Kiei kiba phi iohi:",
    btn_submit_report: "Phah ia ka Ripot",
    offline_queue_title: "Ka Jaka Kynshew Offline",
    offline_queue_desc: "Kynshew ha ka phone bad phah auto ynda ioh network.",
    no_queued_reports: "Ym don ripot ba sahkut.",
    btn_sync_now: "Sync Mynta",
    tab4_title: "DDMA Disaster Control Room",
    tab4_sub: "Ka jingiasyllok bad ka jingpynbna paidbah.",
    sim_title: "Slap Jur Bathieng Simulator",
    sim_desc: "Peit lypa ia ka jingtwa lada slap jur palat.",
    triage_title: "Ki Ripot ba dang peit",
    broadcast_title: "Pynbna Paidbah",
    lbl_b_state: "State / District:",
    lbl_b_severity: "Kyrdan Jingma:",
    lbl_b_msg: "Ka Khubor Maham:",
    btn_dispatch_broadcast: "Pynbna ia ka Khubor",
    tab5_title: "1-Tap SOS & Ka Lynti ba Shngain",
    tab5_sub: "Khad ia ka SOS, phah SMS bad wad ia ka jaka ba shngain.",
    sos_touch_text: "KHAM BAN IOH JINGYARAP",
    evac_route_title: "Ka Lynti ba Shngain ban leit",
    evac_desc: "Wad lynti khlem iaid na ki jaka ba twid khyndew.",
    btn_calc_evac: "Wad Lynti",
    hotlines_title: "Ki Number ba dei ban Phone",
    guide_main_title: "Ka Jingpynda & Ka Jingiarap ha ka Jingma",
    guide_tag: "BAN PYNDA IA KA JINGIM",
    guide_desc: "Ki rukom ban pynda lada don ka jingshlei bad jingtwid khyndew.",
    nav_map: "GIS Map",
    nav_early_warning: "Jingmaham",
    nav_field_report: "Ripot Madan",
    nav_ddma: "DDMA Room",
    nav_sos: "SOS",
    modal_siren_title: "SIREN JINGMAHAM KA SMRANG",
    modal_siren_desc: "Ka siren bad ka ktien maham ka sawa mynta.",
    voice_lang_label: "Ktien:",
    btn_stop_siren: "PYNSANGEH IA KA SIREN"
  },
  mni: {
    header_sub: "অৱাং-নোংপোক লমদমগী লৈবাক চুকপগী ৱাৰ্নিং অমসুং জিআইএস",
    siren_btn: "সাইরেন",
    live_alerts_badge: "লাইভ ৱাৰ্নিং",
    gis_layers_title: "জিআইএস মেপ লেয়রশিং",
    layer_hazards: "লৈবাক চুকপগী অকনবা মফমশিং",
    layer_sensors: "আইওটি সেন্সর ষ্টেসনশিং",
    layer_highways: "লম্বী-থোং অমসুং থিংজিনবা",
    layer_shelters: "তেন্থাফম অমসুং এছডিআৰএফ",
    layer_weather_radar: "নুংশিৎ-ঈশিং: নোংগী রাডার অমসুং নোংলৈ-নুংশিৎ",
    layer_weather_stations: "নুংশিৎ-ঈশিং: আইএমডি মেট ষ্টেশন",
    weather_hud_live: "লাইভ ডপলার রাডার অমসুং নুংশিৎ-ঈশিং",
    basemap_label: "মেপ শৈলী:",
    corridors_label: "মশাফম লম্বী খনব:",
    risk_summary_title: "লমদমগী খুদোংথিবা মাত্ৰা",
    legend_title: "লৈবাক চুকপগী সূচক",
    tab2_title: "টেলিমেট্রি অমসুং মাংজৌননা ৱাৰ্নিং",
    tab2_sub: "আইওটি সেন্সর, নোং চুবগী চাং অমসুং চিংগী শক্তি চাংয়েং তৌবা।",
    refresh_btn: "অনৌবা তৌব",
    ai_predictor_title: "এআই লৈবাক চুকপগী মোডেল",
    lbl_slope: "চিংগী ঢাল কোণ (°):",
    lbl_rain24: "পুং ২৪ নোং চুব (মিমি):",
    lbl_vwc: "লৈবাক্কী অশেৎপা (%):",
    lbl_pwp: "ঈশিংগী প্রেসার (kPa):",
    lbl_velocity: "চুকপগী খোঙজেল (মিমি/পুং):",
    lbl_lithology: "নুং অমসুং লৈবাক্কী মখল:",
    btn_calc_risk: "খুদোংথিবা সূচক (LHI) থিব",
    fos_title: "সেফটি ফেক্টৰ (FoS)",
    fos_desc: "চিংগী মপুংফাবা সেফটি চাংয়েং তৌব।",
    tab3_title: "ফিল্ড রিপোৰ্ট অমসুং লৈবাক কায়ব",
    tab3_sub: "ইন্টৰনেট য়াওদনা অফলাইন মোদতা লৈবাক কায়বগী পাও থাব য়াই।",
    lbl_name: "রিপোর্টারগী মিং:",
    lbl_state: "ষ্টেট:",
    lbl_location: "মফম / লম্বী কিমি:",
    btn_gps: "জিপিএছ লৌব",
    fissure_heading: "লৈবাক কায়বগী চাং",
    lbl_crack_type: "কায়বগী মখল:",
    lbl_crack_w: "পাকপা (মিমি):",
    lbl_crack_d: "লুবা (সেমি):",
    lbl_crack_l: "শাংবা (মিতর):",
    lbl_subsidence: "লম্বী তাবা (সেমি):",
    lbl_photo: "ফোতো থাব:",
    lbl_notes: "নহাক্না উবা ফোংদোকপ:",
    btn_submit_report: "রিপোৰ্ট থাব (অফলাইন সংৰক্ষণ)",
    offline_queue_title: "অফলাইন কিউ",
    offline_queue_desc: "ইন্টৰনেট লৈতবা মতমদা লোকেলদা থমগনি অমসুং ইন্টৰনেট য়াওরকপদা ওতোমেতিক সিঙ্ক তৌগনি।",
    no_queued_reports: "অফলাইন রিপোৰ্ট অমতা লৈতে।",
    btn_sync_now: "হৌজিক সিঙ্ক তৌব",
    tab4_title: "দিষ্ট্ৰিক দিজাষ্টৰ কন্ত্রোল ৰুম",
    tab4_sub: "দিজাষ্টৰ মেনেজমেন্ট অমসুং ইমার্জেন্সী ব্রোদকাষ্ট।",
    sim_title: "নোং চুবা সিমুলেটৰ",
    sim_desc: "অকনবা নোং চুরবদি করম্না চুক্কনি হায়বগী চাংয়েং।",
    triage_title: "রিপোৰ্টশিং য়েংশিনবা",
    broadcast_title: "ইমার্জেন্সী ৱাৰ্নিং ব্রোদকাষ্ট",
    lbl_b_state: "ষ্টেট / দিষ্ট্ৰিক:",
    lbl_b_severity: "ৱাৰ্নিং স্তৰ:",
    lbl_b_msg: "ৱাৰ্নিং পাউজেল:",
    btn_dispatch_broadcast: "পাউজেল থাব",
    tab5_title: "১-তেপ এছওএছ অমসুং কন্নবা লম্বী",
    tab5_sub: "ইমার্জেন্সী এসওএস, জিপিএস পাউজেল অমসুং সেফ লম্বী।",
    sos_touch_text: "খুদোংথিবদা নম্মু",
    evac_route_title: "সেফ লম্বী থিব",
    evac_desc: "চুক্লবা লম্বীশিং থিংজিনদুনা তেন্থাফমদা চৎনবা লম্বী।",
    btn_calc_evac: "সেফ লম্বী থিব",
    hotlines_title: "২৪/৭ হেল্পলাইন নম্বরশিং",
    guide_main_title: "অকনবা খুদোংথিবদা কনবা ঙম্নবা অমসুং সেফটি গাইদ",
    guide_tag: "পুন্সি কনবগী নিয়ম",
    guide_desc: "লৈবাক চুকপা মতমদা মশাবু করম্না কনগনি হায়বগী মরুওইবা পাউজেল।",
    nav_map: "জিআইএস মেপ",
    nav_early_warning: "ৱাৰ্নিং",
    nav_field_report: "ফিল্ড রিপোৰ্ট",
    nav_ddma: "দিদিএমএ",
    nav_sos: "এসওএস",
    modal_siren_title: "ৱাৰ্নিং সাইরেন খোংলে",
    modal_siren_desc: "অকনবা সাইরেন অমসুং লোকেল লোনদা পাউজেল তাখ্রে।",
    voice_lang_label: "লোন:",
    btn_stop_siren: "সাইরেন লেপহন্নব"
  }
};

// Spoken phrases for emergency siren voice announcement
const SPOKEN_ALERTS = {
  en: "Emergency Warning: Imminent landslide risk detected in your corridor. Avoid mountain highways and move to designated evacuation shelter.",
  hi: "आपातकालीन चेतावनी: आपके क्षेत्र में भारी भूस्खलन का गंभीर खतरा है। पहाड़ी राजमार्गों पर यात्रा न करें और तुरंत सुरक्षित आश्रय स्थल पर पहुंचे।",
  as: "জৰুৰীকালীন সতৰ্কবাণী: আপোনাৰ অঞ্চলত প্ৰচণ্ড ভূমিস্খলনৰ আশংকা। পাহাৰীয়া পথত যাতায়ত নকৰিব আৰু সুৰক্ষিত আশ্ৰয় শিবিৰলৈ যাওক।",
  bn: "জরুরি সতর্কতা: আপনার এলাকায় তীব্র ভূমিধসের আশঙ্কা। পাহাড়ি রাস্তায় চলাচল বন্ধ রাখুন এবং নিকটবর্তী নিরাপদ আশ্রয়ে পৌঁছান।",
  ne: "आपतकालीन चेतावनी: तपाईको क्षेत्रमा पहिरोको गम्भीर जोखिम छ। पहाडी सडकहरूमा यात्रा नगर्नुहोस् र सुरक्षित आश्रयस्थलमा जानुहोस्।",
  mzo: "Hriattirna: I awmna bul hnaiah leimin hlauhawm a awm e. Kawngpui hlauhawm pan lo la, hmun him lam pan nghal rawh.",
  kha: "Ka jingmaham: Don ka jingshlei khyndew kaba jur hajan jong phi. Ym bit ban iaid na ki surok lum bad leit shaki jaka ba shngain.",
  mni: "ইমার্জেন্সী ৱাৰ্নিং: নহাক্কী মফমদা লৈবাক চুকপগী অকনবা খুদোংথিবা লৈরে। পাহারি লম্বীদা চৎকনু অমসুং শাফবা মফমদা চৎলু।"
};

// Web Audio API Disaster Siren Synthesizer
class DisasterSirenEngine {
  constructor() {
    this.audioCtx = null;
    this.oscillator1 = null;
    this.oscillator2 = null;
    this.gainNode = null;
    this.isPlaying = false;
    this.lfo = null;
  }

  initContext() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContext();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  startSiren() {
    if (this.isPlaying) return;
    try {
      this.initContext();

      const now = this.audioCtx.currentTime;

      // Master Gain
      this.gainNode = this.audioCtx.createGain();
      this.gainNode.gain.setValueAtTime(0.3, now);
      this.gainNode.connect(this.audioCtx.destination);

      // Main High-Decibel Carrier Oscillator
      this.oscillator1 = this.audioCtx.createOscillator();
      this.oscillator1.type = 'sawtooth';
      this.oscillator1.frequency.setValueAtTime(650, now);

      // Secondary Harmonizing Oscillator for ominous dual tone
      this.oscillator2 = this.audioCtx.createOscillator();
      this.oscillator2.type = 'sine';
      this.oscillator2.frequency.setValueAtTime(850, now);

      // LFO (Low Frequency Oscillator) to modulate frequency between 500Hz and 950Hz
      this.lfo = this.audioCtx.createOscillator();
      this.lfo.frequency.setValueAtTime(0.65, now); // ~0.65 Hz wail period
      
      const lfoGain = this.audioCtx.createGain();
      lfoGain.gain.setValueAtTime(250, now);

      this.lfo.connect(lfoGain);
      lfoGain.connect(this.oscillator1.frequency);
      lfoGain.connect(this.oscillator2.frequency);

      this.oscillator1.connect(this.gainNode);
      this.oscillator2.connect(this.gainNode);

      this.lfo.start(now);
      this.oscillator1.start(now);
      this.oscillator2.start(now);

      this.isPlaying = true;
    } catch (err) {
      console.warn("Web Audio API siren error:", err);
    }
  }

  stopSiren() {
    if (!this.isPlaying) return;
    try {
      if (this.oscillator1) {
        this.oscillator1.stop();
        this.oscillator1.disconnect();
      }
      if (this.oscillator2) {
        this.oscillator2.stop();
        this.oscillator2.disconnect();
      }
      if (this.lfo) {
        this.lfo.stop();
        this.lfo.disconnect();
      }
      this.isPlaying = false;
    } catch (err) {
      console.warn("Error stopping siren:", err);
    }
  }
}

// Global Siren Instance
const sirenEngine = new DisasterSirenEngine();

// Speech Synthesizer for localized announcements
function speakRegionalAlert(langCode = 'en') {
  if (!('speechSynthesis' in window)) return;

  window.speechSynthesis.cancel();
  const phrase = SPOKEN_ALERTS[langCode] || SPOKEN_ALERTS.en;
  const utterance = new SpeechSynthesisUtterance(phrase);

  // Map language codes to BCP 47 tags where possible
  const langMap = {
    en: 'en-IN',
    hi: 'hi-IN',
    bn: 'bn-IN',
    ne: 'ne-NP',
    as: 'as-IN',
    mzo: 'en-IN',
    kha: 'en-IN',
    mni: 'bn-IN'
  };

  utterance.lang = langMap[langCode] || 'en-IN';
  utterance.rate = 0.92;
  utterance.pitch = 1.05;
  utterance.volume = 1.0;

  window.speechSynthesis.speak(utterance);
}

// Exported Alert Controller
window.AlertsController = {
  i18n: I18N_DICTIONARY,
  spokenPhrases: SPOKEN_ALERTS,
  siren: sirenEngine,
  speak: speakRegionalAlert,
  currentLang: 'en',

  setLanguage(langCode) {
    if (!I18N_DICTIONARY[langCode]) langCode = 'en';
    this.currentLang = langCode;

    // Apply translations to all elements with data-i18n
    const dict = I18N_DICTIONARY[langCode];
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (dict[key]) {
        el.textContent = dict[key];
      }
    });

    const voiceLabel = document.getElementById('voiceLangLabel');
    if (voiceLabel) {
      const langNames = {
        en: 'English', hi: 'हिन्दी', as: 'অসমীয়া', bn: 'বাংলা',
        ne: 'नेपाली', mzo: 'Mizo ṭawng', kha: 'Khasi', mni: 'মৈতৈলোন্'
      };
      voiceLabel.textContent = langNames[langCode] || langCode;
    }
  },

  triggerEmergencySiren(langCode) {
    const modal = document.getElementById('sirenModal');
    if (modal) modal.style.display = 'flex';
    this.siren.startSiren();
    this.speak(langCode || this.currentLang);
  },

  stopEmergencySiren() {
    const modal = document.getElementById('sirenModal');
    if (modal) modal.style.display = 'none';
    this.siren.stopSiren();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
};
