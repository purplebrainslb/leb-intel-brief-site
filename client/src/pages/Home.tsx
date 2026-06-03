import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, TrendingUp, MapPin, Clock, AlertTriangle, Info } from "lucide-react";
import { briefingData } from "@/data/briefing";
import { useState } from "react";

const severityColors = {
  critical: "bg-red-900/20 text-red-300 border-red-800",
  high: "bg-orange-900/20 text-orange-300 border-orange-800",
  medium: "bg-yellow-900/20 text-yellow-300 border-yellow-800",
  low: "bg-blue-900/20 text-blue-300 border-blue-800"
};

const assessmentColors = {
  "Unchanged/Deteriorating": "bg-red-900/20 text-red-300",
  "Unchanged/Impasse": "bg-orange-900/20 text-orange-300",
  "More Likely to Deteriorate": "bg-red-900/20 text-red-300",
  "Elevated Risk": "bg-red-900/20 text-red-300"
};

export default function Home() {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/95 backdrop-blur-sm">
        <div className="container max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-white tracking-tight">
                Lebanon Daily Intelligence Brief
              </h1>
              <p className="text-slate-400 mt-1">Conflict tracking & regional developments</p>
            </div>
            <div className="hidden sm:block text-right">
              <div className="flex items-center gap-2 text-slate-300 text-sm mb-2">
                <Clock className="w-4 h-4" />
                <span>Last updated: {briefingData.lastUpdated.split("T")[0]}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300 text-sm">
                <MapPin className="w-4 h-4" />
                <span>{briefingData.location}</span>
              </div>
            </div>
          </div>
          <Separator className="bg-slate-800" />
        </div>
      </header>

      <main className="container max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Key Judgments Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 mb-6">
            <AlertCircle className="w-6 h-6 text-red-400" />
            <h2 className="text-3xl font-bold text-white">Key Judgments</h2>
          </div>

          <div className="grid gap-4">
            {briefingData.keyJudgments.map((judgment) => (
              <Card key={judgment.id} className={`border ${severityColors[judgment.severity as keyof typeof severityColors]} bg-slate-900/50 hover:bg-slate-900/70 transition-colors cursor-pointer`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-lg text-white">{judgment.title}</CardTitle>
                      <Badge variant="outline" className="mt-2 bg-slate-800/50">
                        {judgment.region}
                      </Badge>
                    </div>
                    <div className="text-2xl">
                      {judgment.severity === "critical" && "🔴"}
                      {judgment.severity === "high" && "🟠"}
                      {judgment.severity === "medium" && "🟡"}
                      {judgment.severity === "low" && "🔵"}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-300 leading-relaxed">{judgment.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <Separator className="bg-slate-800" />

        {/* Detailed Sections */}
        {briefingData.sections.map((section) => (
          <section key={section.id} className="space-y-4">
            <div className="flex items-center gap-3 mb-6 cursor-pointer" onClick={() => setExpandedSection(expandedSection === section.id ? null : section.id)}>
              <TrendingUp className="w-6 h-6 text-blue-400" />
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white">{section.title}</h2>
                <p className="text-slate-400 text-sm">{section.subtitle}</p>
              </div>
              <span className="text-slate-400 text-sm">{section.items.length} updates</span>
            </div>

            <div className="grid gap-3">
              {section.items.map((item, idx) => (
                <Card key={idx} className={`border-l-4 ${item.severity ? severityColors[item.severity as keyof typeof severityColors] : "border-slate-700"} bg-slate-900/50 hover:bg-slate-900/70 transition-colors`}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-4">
                      <CardTitle className="text-base text-white">{item.heading}</CardTitle>
                      <Badge variant="secondary" className="text-xs bg-slate-800 text-slate-300 shrink-0">
                        {item.source}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-300 text-sm leading-relaxed">{item.content}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Separator className="bg-slate-800 mt-8" />
          </section>
        ))}

        {/* 30-Day Outlook */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-6 h-6 text-purple-400" />
            <h2 className="text-3xl font-bold text-white">30-Day Outlook</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {briefingData.outlook30Days.map((outlook, idx) => (
              <Card key={idx} className={`border-l-4 ${assessmentColors[outlook.assessment as keyof typeof assessmentColors]} bg-slate-900/50 hover:bg-slate-900/70 transition-colors`}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-white">{outlook.category}</CardTitle>
                  <Badge className="w-fit mt-2 bg-slate-800/50 text-slate-200">
                    {outlook.assessment}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-300 text-sm leading-relaxed">{outlook.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Footer */}
        <section className="mt-12 pt-8 border-t border-slate-800">
          <div className="bg-slate-900/30 border border-slate-800 rounded-lg p-6 space-y-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-400 mt-1 shrink-0" />
              <div>
                <h3 className="font-semibold text-white mb-2">About This Brief</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  This Daily Intelligence Brief is compiled from major Lebanese outlets (Naharnet, L'Orient Today, LBCI, Al Jadeed, MTV Lebanon, NBN), international sources (Al Jazeera, Reuters, BBC, AP, UN), and regional analysts. All major incidents across Lebanon — including Beirut, Dahieh, Mount Lebanon, the Metn, the north, the Bekaa, and the south — are tracked and reported.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-400 mt-1 shrink-0" />
              <div>
                <h3 className="font-semibold text-white mb-2">Data Accuracy</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Unconfirmed items are flagged explicitly. This brief reflects the most current reporting available as of the morning update. Casualty figures, displacement numbers, and military assessments are sourced from official statements, UN agencies, and credible media outlets.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer Bar */}
      <footer className="border-t border-slate-800 bg-slate-950/50 mt-12">
        <div className="container max-w-6xl mx-auto px-4 py-6 text-center text-slate-500 text-sm">
          <p>Lebanon Daily Intelligence Brief • Updated daily at 07:00 Beirut time • Data as of {briefingData.date}</p>
        </div>
      </footer>
    </div>
  );
}
