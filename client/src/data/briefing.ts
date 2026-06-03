export const briefingData = {
  date: "June 3, 2026",
  location: "Beirut, Lebanon",
  lastUpdated: "2026-06-03T04:01:00Z",
  
  keyJudgments: [
    {
      id: 1,
      title: "\"Partial Ceasefire\" Fragile as Strikes Continue",
      description: "Despite Trump's announcement of a partial ceasefire, Israeli operations continued heavily in southern Lebanon — Tebnine, Ain Baal, Nabatieh. The arrangement holds only for Beirut's Dahieh. Hezbollah has explicitly rejected any \"partial\" deal, demanding a comprehensive halt.",
      severity: "critical",
      region: "Lebanon"
    },
    {
      id: 2,
      title: "US–Iran Tensions Explode in the Gulf",
      description: "Iranian drones struck Kuwait International Airport overnight (June 2–3), causing injuries and suspending flights. Iran also targeted U.S. bases in Bahrain. CENTCOM retaliated with strikes on Qeshm Island and disabled a blockade-violating tanker.",
      severity: "critical",
      region: "Gulf"
    },
    {
      id: 3,
      title: "Ceasefire Negotiations Stall",
      description: "Iran reportedly suspended communications with mediators, conditioning talks on a complete halt to Israeli operations in Lebanon. Trump denied the suspension, insisting talks are ongoing \"continuously.\"",
      severity: "high",
      region: "Diplomatic"
    },
    {
      id: 4,
      title: "UNIFIL Future Debated at the Security Council",
      description: "UN Secretary-General Guterres proposed three options for a successor force to UNIFIL (mandated to withdraw Dec 31, 2026), ranging from 5,500 troops to a limited observer mission. Israel and the U.S. oppose the plan; Lebanon, China, and Russia support it.",
      severity: "medium",
      region: "UN/International"
    },
    {
      id: 5,
      title: "Deepening Humanitarian Crisis",
      description: "Collective shelters in Tyre and Saida are full. The UN reports heavily congested roads as families flee renewed evacuation orders. WFP is struggling to deliver aid amid ongoing bombardments.",
      severity: "high",
      region: "Humanitarian"
    }
  ],

  sections: [
    {
      id: "international",
      title: "International Conflict Overview",
      subtitle: "Last 24 hours",
      items: [
        {
          heading: "Kuwait Airport Hit",
          content: "Iranian drones struck Terminal One at Kuwait International Airport, causing severe structural damage and injuries, forcing suspension of all commercial air traffic.",
          source: "AP/The Star",
          severity: "critical"
        },
        {
          heading: "U.S. Retaliation on Qeshm",
          content: "CENTCOM struck an Iranian military ground control station on Qeshm Island in the Strait of Hormuz in \"self-defense.\"" ,
          source: "BBC",
          severity: "high"
        },
        {
          heading: "Blockade Enforcement",
          content: "A U.S. aircraft fired a Hellfire missile into the engine room of the Botswana-flagged M/T Lexie, disabling it as it attempted to reach Iran. Six commercial vessels have now been disabled; 122 redirected since the blockade began April 13.",
          source: "BBC",
          severity: "medium"
        },
        {
          heading: "Diplomatic Stalemate",
          content: "Iranian semiofficial agencies (Fars, Tasnim) reported Tehran stopped communicating with mediators, demanding a Lebanon ceasefire first. Trump disputed this.",
          source: "AP",
          severity: "high"
        },
        {
          heading: "Nuclear Talks",
          content: "Rubio testified before Congress, expressing cautious optimism on nuclear dimensions but insisting sanctions relief is condition-based.",
          source: "BBC",
          severity: "medium"
        },
        {
          heading: "Bab el-Mandeb Threat",
          content: "IRGC Quds Force Commander Ghaani threatened to \"activate\" the Bab el-Mandeb Strait in response to Israeli operations in Lebanon. Senior Houthi officials said their \"hands are on the trigger.\" Assessed as primarily an information operation.",
          source: "ISW",
          severity: "high"
        }
      ]
    },
    {
      id: "lebanon-military",
      title: "Lebanon – Military Situation",
      subtitle: "Last 24 hours",
      items: [
        {
          heading: "Tebnine Hospital Area Struck",
          content: "Israeli strikes killed 5 (incl. a child), wounded 48. Among the wounded: a doctor and 5 employees of Tebnine Governmental Hospital, which sustained significant damage.",
          source: "Naharnet/AFP",
          severity: "critical"
        },
        {
          heading: "Ain Baal (Tyre District)",
          content: "Israeli drone strikes killed at least 2 on a motorcycle on Martyr Sabra Street. Additional strikes reported in Deir Qanoun al-Nahr, al-Namiriya, and Ansar.",
          source: "L'Orient Today / NNA",
          severity: "high"
        },
        {
          heading: "Nabatieh Evacuation Order",
          content: "The IDF issued a forced evacuation warning for Nabatieh, calling for immediate evacuation north of the Zahrani River.",
          source: "LBCI",
          severity: "high"
        },
        {
          heading: "Ground Operations North of Litani",
          content: "The IDF's Givati Brigade is operating in Zawtar al-Sharqiyah and Zawtar al-Gharbiya, west of Beaufort Castle. The IDF claims 20 Hezbollah operatives killed and hundreds of weapons seized in civilian homes.",
          source: "Times of Israel",
          severity: "medium"
        },
        {
          heading: "Dahieh Status — Holding Tenuously",
          content: "No Israeli strikes on Beirut's southern suburbs since the partial ceasefire announcement. However, Israel warned it will resume strikes if Hezbollah attacks Israeli cities. Hezbollah's Qomati reiterated the group will not accept a partial ceasefire.",
          source: "Naharnet",
          severity: "medium"
        },
        {
          heading: "Hezbollah Activity",
          content: "Hezbollah scaled down but did not halt attacks — drones and rockets were fired toward Safed and other northern Israeli areas. One IDF reservist was moderately injured and three soldiers lightly hurt by an explosive drone in southern Lebanon.",
          source: "Times of Israel",
          severity: "medium"
        }
      ]
    },
    {
      id: "lebanon-government",
      title: "Lebanon – Government, LAF, Internal Security",
      subtitle: "Last 24 hours",
      items: [
        {
          heading: "Washington Talks (4th Round)",
          content: "Lebanese and Israeli ambassadors met at the State Department for a fourth round of talks. The U.S. State Department cited \"progress.\" Discussions explored \"pilot zones\" — phased geographic areas for ceasefire, IDF withdrawal, and LAF deployment.",
          source: "Times of Israel",
          severity: "medium"
        },
        {
          heading: "Post-UNIFIL Force",
          content: "Guterres submitted three options for a successor UN force to the Security Council. The most robust option includes ~5,500 personnel; the minimum involves 215 unarmed observers. Lebanon supports a continued UN presence; the U.S. and Israel oppose it.",
          source: "France24 / i24",
          severity: "medium"
        },
        {
          heading: "Deir Mimas Mayor Shooting",
          content: "The Lebanese Army arrested suspect F.B. in connection with the fatal shooting of Mayor Souheil Abou Jamra of Deir Mimas (Marjayoun district). Motive remains under judicial investigation.",
          source: "L'Orient Today / MTV Lebanon",
          severity: "low"
        },
        {
          heading: "PM Salam's Position",
          content: "PM Nawaf Salam reiterated that all decisions of war and peace must remain solely in the hands of the Lebanese state and called for all armed forces to be unified under the LAF.",
          source: "Terrorism Info / ISW",
          severity: "low"
        }
      ]
    },
    {
      id: "humanitarian",
      title: "Humanitarian / Economic Situation",
      subtitle: "Last 24 hours",
      items: [
        {
          heading: "Mass Displacement",
          content: "Over 200,000 people have fled southern Lebanon since March 2. Collective shelters in Tyre and Saida are full. Families are sleeping in open areas. UNHCR reports people leaving Dahieh by car, motorcycle, and on foot.",
          source: "UN Noon Briefing, June 1",
          severity: "critical"
        },
        {
          heading: "Healthcare Under Attack",
          content: "The Tebnine Governmental Hospital strike is the latest in a series. Eight hospitals have been forced to close due to strike damage since September. WHO recorded five attacks on healthcare in the three days prior to June 1, resulting in one health worker killed and 19 injured.",
          source: "UN / L'Orient Today",
          severity: "critical"
        },
        {
          heading: "WFP Aid Delivery",
          content: "WFP is supporting ~150,000 people per day but reports that ongoing bombardments and displacement are constraining delivery in hard-to-reach areas. A revised Flash Appeal will be launched in Geneva on Friday.",
          source: "UN Noon Briefing",
          severity: "high"
        },
        {
          heading: "Generator Tariffs — First Decline",
          content: "Private generator tariffs dropped by ~LL3,106/kWh for May consumption (down from April), tracking a 7% decline in diesel prices. A modest economic reprieve for Beirut and Mount Lebanon residents.",
          source: "L'Orient Today",
          severity: "low"
        }
      ]
    },
    {
      id: "regional",
      title: "Regional Developments Directly Affecting Lebanon",
      subtitle: "Last 24 hours",
      items: [
        {
          heading: "Iran's Leverage Play",
          content: "Iran is conditioning further U.S.-Iran negotiations on a complete ceasefire in Lebanon, effectively linking the two conflicts and complicating U.S. efforts to decouple them. ISW assesses this as a deliberate tactic to buy time and preserve Iran's nuclear leverage.",
          source: "ISW",
          severity: "high"
        },
        {
          heading: "Iraqi Militia Posture",
          content: "The Iraqi Shia Coordination Framework announced support for restricting arms to the state and separating the PMF from political frameworks — likely a response to intensified U.S. pressure rather than genuine disarmament intent.",
          source: "ISW",
          severity: "medium"
        }
      ]
    }
  ],

  outlook30Days: [
    {
      category: "Battlefield",
      assessment: "Unchanged/Deteriorating",
      description: "The partial ceasefire is structurally fragile. Israel will continue deep operations north of the Litani. A Dahieh strike remains a credible risk if Hezbollah escalates. Hezbollah's fiber-optic drone campaign will sustain attrition."
    },
    {
      category: "Politics",
      assessment: "Unchanged/Impasse",
      description: "The Washington track will remain deadlocked. Hezbollah refuses disarmament without a comprehensive ceasefire; Israel refuses withdrawal without it. The \"pilot zones\" concept is the most promising incremental step but faces Hezbollah opposition."
    },
    {
      category: "Humanitarian",
      assessment: "More Likely to Deteriorate",
      description: "Shelter capacity is exhausted. Healthcare infrastructure in the south is near collapse. The WFP Flash Appeal revision signals that needs have far outpaced the original $308M estimate."
    },
    {
      category: "Regional Escalation",
      assessment: "Elevated Risk",
      description: "The direct U.S.-Iran military exchange in the Gulf (Kuwait airport, Qeshm Island) is the most significant escalation since the war began. If Iran follows through on Bab el-Mandeb threats, the economic and military consequences would be severe."
    }
  ]
};
