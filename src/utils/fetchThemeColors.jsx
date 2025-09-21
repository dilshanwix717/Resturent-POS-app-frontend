import newRequest from './newRequest';
import fs from 'fs';

const updateThemeColors = async () => {
    try {
        const companyId = localStorage.getItem('companyId');
        const response = await newRequest.get('/themes');
        const themes = response.data;

        // Filter the theme for the current company
        const theme = themes.find(t => t.companyID === companyId);

        if (theme) {
            const colors = {
                primary: theme.primaryColor.toLowerCase(),
                secondary: theme.secondaryColor.toLowerCase(),
                text: "#000"
            };
            console.log(colors)

            // Update colors.json
            fs.writeFileSync('../constants/colors.json', JSON.stringify(colors, null, 2));

            console.log('Theme colors updated successfully.');
        } else {
            console.error('No theme found for the given company ID.');
        }
    } catch (error) {
        console.error('Error fetching or updating theme colors:', error);
    }
};

updateThemeColors();
