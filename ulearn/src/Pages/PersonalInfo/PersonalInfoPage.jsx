import React, { useState } from 'react';
import Select from 'react-select';
import { UserButton } from '@clerk/clerk-react';
import './PersonalInfoPage.css';
import vectImg from '../../assets/images/vectImg.png'
import { universities, years, languages } from './constants';

const customStyles = {
    control: (provided, state) => ({
        ...provided,
        border: '2px solid black',
        borderRadius: '40px',
        padding: '5px',
        margin: '30px 0px',
        boxShadow: state.isFocused ? '0 0 0 1px black' : null,
        '&:hover': {
            borderColor: 'black',
        },
    }),
    menu: (provided) => ({
        ...provided,
        borderRadius: '8px',
    }),
    option: (provided, state) => ({
        ...provided,
        backgroundColor: state.isSelected ? 'rgb(22, 86, 166)' : 'white',
        '&:hover': {
            backgroundColor: 'rgb(22, 86, 166)',
        },
    }),
};

const PersonalInfoPage = () => {
    const [selectedUniversity, setSelectedUniversity] = useState(null);
    const [selectedYear, setSelectedYear] = useState(null);
    const [selectedLanguages, setSelectedLanguages] = useState([]);

    const handleUniChange = (selectedUniversity) => {
        setSelectedUniversity(selectedUniversity);
    };

    const handleYearChange = (selectedYear) => {
        setSelectedYear(selectedYear);
    };

    const handleLanguageChange = (selectedLanguages) => {
        setSelectedLanguages(selectedLanguages);
    };
    const handleNext = (event) => {
        event.preventDefault();
        if (selectedLanguages && selectedUniversity && selectedYear) {
            // console.log("IM HERE");
            window.location.href = "/whoAreYou"
        }
        else {
            return
        }
    }
    return (
        <div className='container'>
            <div className='image-container'>
                <img src={vectImg}></img>
            </div>
            <div className='wrapper'>
                <form onSubmit={handleNext}>
                    <h2>Personal Info</h2>
                    <UserButton />
                    <div>
                        <Select 
                            placeholder="Which University do you attend?"
                            required={true}
                            options={universities}
                            value={selectedUniversity}
                            onChange={handleUniChange}
                            styles={customStyles}
                        />                
                    </div>
                    <div>
                        <Select
                            placeholder="What is your year of study?"
                            required={true}
                            options={years}
                            value={selectedYear}
                            onChange={handleYearChange}
                            styles={customStyles}
                        />
                    </div>
                    <div>
                        <Select
                            placeholder="What languages do you speak?"
                            required={true}
                            options={languages}
                            value={selectedLanguages}
                            onChange={handleLanguageChange}
                            isMulti={true}
                            styles={customStyles}
                        />
                    </div>
                    <input type='submit' value='Next'></input>                   
                </form>
            </div>
    </div>
    );
};

export default PersonalInfoPage;
