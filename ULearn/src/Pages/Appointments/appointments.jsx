import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useUser } from '@clerk/clerk-react';
import Nav from '../../components/Nav/Nav';
import { Tab, Tabs } from '../../components/tabs';
import AppointmentList from '../../components/Appointment/appointmentList.jsx'

const AppointmentsPage = () => {
    const { isLoaded, user } = useUser();
    const [appointments, setAppointments] = useState([]);
    const [pending, setPending] = useState([]);
    const [archive, setArchive] = useState([]);    

    useEffect(() => {
        const getAppointments = async () => {
            if (user && user.id){
                try {
                    const response = await axios.get(`http://localhost:3001/appointments/${user.id}`); //get a users appointment
                    const appointmentsData = response.data[0]?.appointments || [];
                    //appointmentsData.map(appt )
                    //const sortedAppointments = appointmentsData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                    setAppointments(appointmentsData);
                } catch (error) {
                    console.error('Error fetching appointments:', error);
                }
            }
        };
        getAppointments();
    }, [user, isLoaded]);

    return (
        <div className='bg-white w-full h-fit min-h-full min-w-screen '> 
            <div className='border-gray-300 border-b-2 bg-white w-screen shadow-lg min-w-full sticky top-0'>
                <Nav></Nav>
            </div>
            <div className='flex justify-center items-center my-5 pt-5'>
                <Tabs className='bg-gray-200'>
                    <Tab label="Appointments">
                        <div className='overflow-y-scroll max-h-screen bg-gray-50 min-h-screen'>
                            <AppointmentList
                                appointments={appointments}
                            >
                            </AppointmentList>
                        </div>
                    </Tab>
                    <Tab label="Pending">
                        <div className='overflow-y-scroll max-h-screen bg-gray-50 min-h-screen'>
                            <AppointmentList
                                appointments={pending}
                            >
                            </AppointmentList>
                        </div>
                    </Tab>
                    <Tab label="Archive">
                        <div className='overflow-y-scroll max-h-screen bg-gray-50 min-h-screen'>
                            <AppointmentList
                                appointments={archive}
                            >
                            </AppointmentList>
                        </div>
                    </Tab>
                </Tabs>
            </div>
        </div>
    )
}

export default AppointmentsPage;