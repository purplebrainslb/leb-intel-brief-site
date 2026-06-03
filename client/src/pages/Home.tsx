import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  const [activeTab, setActiveTab] = useState("judgments");

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/95 backdrop-blur-sm">
        <div className="container max-w-full mx-auto px-4 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight">
                Lebanon Daily Intelligence Brief
              </h1>
              <p className="text-slate-400 mt-1 text-xs sm:text-sm">Conflict tracking & regional developments</p>
            </div>
            <div className="text-right text-xs sm:text-sm">
              <div className="flex items-center gap-2 text-slate-300 mb-1">
                <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Last updated: {briefingData.lastUpdated.split("T")[0]}</span>
                <span className="sm:hidden">{briefingData.lastUpdated.split("T")[0]}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>{briefingData.location}</span>
              </div>
            </div>
          </div>
          <Separator className="bg-slate-800" />
        </div>
      </header>

      <main className="container max-w-full mx-auto px-4 py-6 sm:py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Tab Navigation */}
          <TabsList className="flex flex-wrap justify-start gap-1 sm:gap-2 mb-6 sm:mb-8 bg-slate-900/50 border border-slate-800 p-2 sm:p-3 rounded-lg w-full">
            <TabsTrigger value="judgments" className="text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 whitespace-nowrap">
              Key Insights
            </TabsTrigger>
            <TabsTrigger value="international" className="text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 whitespace-nowrap">
              International
            </TabsTrigger>
            <TabsTrigger value="military" className="text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 whitespace-nowrap">
              Military
            </TabsTrigger>
            <TabsTrigger value="government" className="text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 whitespace-nowrap">
              Government
            </TabsTrigger>
            <TabsTrigger value="humanitarian" className="text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 whitespace-nowrap">
              Humanitarian
            </TabsTrigger>
            <TabsTrigger value="regional" className="text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 whitespace-nowrap">
              Regional
            </TabsTrigger>
            <TabsTrigger value="outlook" className="text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 whitespace-nowrap">
              30 Days Outlook
            </TabsTrigger>
          </TabsList>

          {/* Key Judgments Tab */}
          <TabsContent value="judgments" className="space-y-4">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-400 flex-shrink-0" />
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">Key Insights</h2>
            </div>

            <div className="grid gap-4">
              {briefingData.keyJudgments.map((judgment) => (
                <Card key={judgment.id} className={`border ${severityColors[judgment.severity as keyof typeof severityColors]} bg-slate-900/50 hover:bg-slate-900/70 transition-colors`}>
                  <CardHeader className="pb-2 sm:pb-3">
                    <div className="flex items-start justify-between gap-2 sm:gap-4">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base sm:text-lg text-white break-words">{judgment.title}</CardTitle>
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
                    <p className="text-slate-300 text-sm sm:text-base leading-relaxed">{judgment.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* International Tab */}
          <TabsContent value="international" className="space-y-4">
            <div className="flex items-start gap-2 sm:gap-3 mb-4 sm:mb-6">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400 flex-shrink-0 mt-1" />
              <div className="min-w-0">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">International Conflict Overview</h2>
                <p className="text-slate-400 text-xs sm:text-sm">Last 24 hours</p>
              </div>
            </div>

            <div className="grid gap-3">
              {briefingData.sections[0].items.map((item, idx) => (
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
          </TabsContent>

          {/* Military Tab */}
          <TabsContent value="military" className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp className="w-6 h-6 text-orange-400" />
              <div>
                <h2 className="text-3xl font-bold text-white">Lebanon – Military Situation</h2>
                <p className="text-slate-400 text-sm">Last 24 hours</p>
              </div>
            </div>

            <div className="grid gap-3">
              {briefingData.sections[1].items.map((item, idx) => (
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
          </TabsContent>

          {/* Government Tab */}
          <TabsContent value="government" className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp className="w-6 h-6 text-purple-400" />
              <div>
                <h2 className="text-3xl font-bold text-white">Lebanon – Government, LAF, Internal Security</h2>
                <p className="text-slate-400 text-sm">Last 24 hours</p>
              </div>
            </div>

            <div className="grid gap-3">
              {briefingData.sections[2].items.map((item, idx) => (
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
          </TabsContent>

          {/* Humanitarian Tab */}
          <TabsContent value="humanitarian" className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
              <AlertTriangle className="w-6 h-6 text-yellow-400" />
              <div>
                <h2 className="text-3xl font-bold text-white">Humanitarian / Economic Situation</h2>
                <p className="text-slate-400 text-sm">Last 24 hours</p>
              </div>
            </div>

            <div className="grid gap-3">
              {briefingData.sections[3].items.map((item, idx) => (
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
          </TabsContent>

          {/* Regional Tab */}
          <TabsContent value="regional" className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
              <MapPin className="w-6 h-6 text-green-400" />
              <div>
                <h2 className="text-3xl font-bold text-white">Regional Developments Directly Affecting Lebanon</h2>
                <p className="text-slate-400 text-sm">Last 24 hours</p>
              </div>
            </div>

            <div className="grid gap-3">
              {briefingData.sections[4].items.map((item, idx) => (
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
          </TabsContent>

          {/* 30-Day Outlook Tab */}
          <TabsContent value="outlook" className="space-y-4">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400 flex-shrink-0" />
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">30-Day Outlook</h2>
            </div>

            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
              {briefingData.outlook30Days.map((outlook, idx) => (
                <Card key={idx} className={`border-l-4 ${assessmentColors[outlook.assessment as keyof typeof assessmentColors]} bg-slate-900/50 hover:bg-slate-900/70 transition-colors`}>
                  <CardHeader className="pb-2 sm:pb-3">
                    <CardTitle className="text-base sm:text-lg text-white">{outlook.category}</CardTitle>
                    <Badge className="w-fit mt-2 bg-slate-800/50 text-slate-200 text-xs">
                      {outlook.assessment}
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">{outlook.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <section className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-slate-800">
          <div className="bg-slate-900/30 border border-slate-800 rounded-lg p-4 sm:p-6 space-y-4">
            <div className="flex items-start gap-2 sm:gap-3">
              <Info className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400 mt-1 shrink-0" />
              <div className="min-w-0">
                <h3 className="font-semibold text-white mb-1 sm:mb-2 text-sm sm:text-base">About This Brief</h3>
                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                  This Daily Intelligence Brief is compiled from major Lebanese outlets (Naharnet, L'Orient Today, LBCI, Al Jadeed, MTV Lebanon, NBN), international sources (Al Jazeera, Reuters, BBC, AP, UN), and regional analysts. All major incidents across Lebanon — including Beirut, Dahieh, Mount Lebanon, the Metn, the north, the Bekaa, and the south — are tracked and reported.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2 sm:gap-3">
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 mt-1 shrink-0" />
              <div className="min-w-0">
                <h3 className="font-semibold text-white mb-1 sm:mb-2 text-sm sm:text-base">Data Accuracy</h3>
                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                  Unconfirmed items are flagged explicitly. This brief reflects the most current reporting available as of the morning update. Casualty figures, displacement numbers, and military assessments are sourced from official statements, UN agencies, and credible media outlets.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer Bar */}
      <footer className="border-t border-slate-800 bg-slate-950/50 mt-8 sm:mt-12">
        <div className="container max-w-full mx-auto px-4 py-4 sm:py-6 text-center text-slate-500 text-xs sm:text-sm">
          <p className="break-words">Lebanon Daily Intelligence Brief • Updated daily at 07:00 Beirut time • Data as of {briefingData.date}</p>
        </div>
      </footer>
    </div>
  );
}
