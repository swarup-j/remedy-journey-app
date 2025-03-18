
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { CalendarIcon, Clock, Pill, CheckCircle, Calendar, User } from "lucide-react";

const Index = () => {
  const { toast } = useToast();
  const [greeting, setGreeting] = useState("Good day");
  const [currentDate, setCurrentDate] = useState("");
  const [medicines, setMedicines] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [upcomingMeds, setUpcomingMeds] = useState([]);

  useEffect(() => {
    // Set greeting based on time of day
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");

    // Set current date
    setCurrentDate(new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }));

    // Fetch medicines (simulated)
    setTimeout(() => {
      const dummyMedicines = [
        {
          id: 1,
          name: "Aspirin",
          type: "Tablet",
          color: "#F2FCE2",
          timeSlots: ["08:00", "20:00"],
          days: ["Mon", "Wed", "Fri"],
          taken: [{ timeSlot: "08:00", taken: true }]
        },
        {
          id: 2,
          name: "Vitamin D",
          type: "Capsule",
          color: "#FFDEE2",
          timeSlots: ["09:00"],
          days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
          taken: []
        },
        {
          id: 3,
          name: "Ibuprofen",
          type: "Tablet",
          color: "#FEF7CD",
          timeSlots: ["14:00", "22:00"],
          days: ["Tue", "Thu", "Sat"],
          taken: [{ timeSlot: "14:00", taken: true }]
        }
      ];
      setMedicines(dummyMedicines);

      // Create upcoming timeline
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      
      let nextHours = [];
      for (let i = 1; i <= 3; i++) {
        let nextHour = (hours + i) % 24;
        nextHours.push({
          time: `${nextHour}:${minutes < 10 ? '0' + minutes : minutes}`,
          label: nextHour < 12 ? 'AM' : 'PM',
          meds: i === 1 ? 2 : (i === 2 ? 1 : 0)
        });
      }
      
      setUpcomingMeds(nextHours);
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleTakeMedicine = (medicineId, timeSlot) => {
    // Mark medicine as taken
    setMedicines(medicines.map(med => {
      if (med.id === medicineId) {
        return {
          ...med,
          taken: [...med.taken, { timeSlot, taken: true }]
        };
      }
      return med;
    }));

    toast({
      title: "Medicine marked as taken!",
      description: "Your medication log has been updated.",
    });
  };

  return (
    <div className="app-container max-w-md mx-auto bg-background min-h-screen pb-20">
      <header className="p-5 sticky top-0 z-10 bg-white shadow-sm flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-primary">MediTrack</h1>
        <div className="text-sm text-muted-foreground">{currentDate}</div>
      </header>

      <main className="p-5">
        {/* Greeting Section */}
        <section className="mb-6">
          <Card className="overflow-hidden border-none shadow-lg bg-gradient-to-r from-primary/90 to-primary">
            <CardContent className="p-6 flex justify-between items-center">
              <div className="text-white">
                <h2 className="text-xl font-semibold mb-1">{greeting}!</h2>
                <p className="text-white/80 text-sm">Remember to take your medications on time.</p>
              </div>
              <div className="text-white/80 text-4xl">
                <Pill />
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Today's Medications */}
        <section className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">Today's Medications</h2>
            <a href="medicine-list.html" className="text-sm text-primary hover:underline flex items-center gap-1">
              View All
            </a>
          </div>

          <div className="space-y-3">
            {isLoading ? (
              <div className="flex justify-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : medicines.length === 0 ? (
              <Card className="border border-dashed">
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <Pill className="h-10 w-10 text-muted-foreground mb-2"/>
                  <p className="text-muted-foreground">No medications scheduled for today</p>
                </CardContent>
              </Card>
            ) : (
              medicines.map(medicine => (
                <Card key={medicine.id} className="overflow-hidden hover:shadow-md transition-shadow border-none shadow-sm">
                  <div className="flex">
                    <div className="w-2" style={{ backgroundColor: medicine.color }}></div>
                    <CardContent className="flex-1 p-4">
                      <div className="flex flex-col">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-medium">{medicine.name}</h3>
                            <p className="text-xs text-muted-foreground">{medicine.type}</p>
                          </div>
                        </div>
                        
                        <div className="mt-2 space-y-2">
                          {medicine.timeSlots.map(timeSlot => {
                            const isTaken = medicine.taken.some(t => t.timeSlot === timeSlot);
                            return (
                              <div key={timeSlot} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm">{timeSlot}</span>
                                </div>
                                <Button
                                  size="sm"
                                  variant={isTaken ? "outline" : "default"}
                                  className={isTaken ? "pointer-events-none" : ""}
                                  onClick={() => !isTaken && handleTakeMedicine(medicine.id, timeSlot)}
                                >
                                  {isTaken ? (
                                    <><CheckCircle className="h-4 w-4 mr-1" /> Taken</>
                                  ) : (
                                    "Take"
                                  )}
                                </Button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              ))
            )}
          </div>
        </section>

        {/* Upcoming Section */}
        <section>
          <h2 className="text-lg font-medium mb-4">Upcoming</h2>
          <div className="space-y-4">
            {upcomingMeds.map((hour, index) => (
              <div key={index} className="flex gap-4">
                <div className="w-16 text-right">
                  <div className="text-sm font-medium">{hour.time}</div>
                  <div className="text-xs text-muted-foreground">{hour.label}</div>
                </div>
                <div className="flex-1">
                  <Card className={`border ${hour.meds > 0 ? 'border-primary/20 bg-primary/5' : 'border-dashed'}`}>
                    <CardContent className="p-3 text-sm">
                      {hour.meds > 0 ? (
                        <div className="flex items-center gap-2">
                          <Pill className="h-4 w-4 text-primary" />
                          <span>{hour.meds} medication{hour.meds > 1 ? 's' : ''}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Pill className="h-4 w-4" />
                          <span>No medications</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <div className="fixed bottom-16 right-5 z-10">
        <Button size="icon" className="h-14 w-14 rounded-full shadow-lg">
          <a href="medicine-details.html" className="text-white flex items-center justify-center">
            <span className="text-2xl">+</span>
          </a>
        </Button>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around items-center h-16 z-10 max-w-md mx-auto">
        <a href="index.html" className="flex flex-col items-center justify-center text-primary">
          <Pill className="h-5 w-5" />
          <span className="text-xs mt-1">Home</span>
        </a>
        <a href="medicine-list.html" className="flex flex-col items-center justify-center text-muted-foreground">
          <CalendarIcon className="h-5 w-5" />
          <span className="text-xs mt-1">Medicines</span>
        </a>
        <a href="calendar.html" className="flex flex-col items-center justify-center text-muted-foreground">
          <Calendar className="h-5 w-5" />
          <span className="text-xs mt-1">Calendar</span>
        </a>
        <a href="profile.html" className="flex flex-col items-center justify-center text-muted-foreground">
          <User className="h-5 w-5" />
          <span className="text-xs mt-1">Profile</span>
        </a>
      </nav>
    </div>
  );
};

export default Index;
