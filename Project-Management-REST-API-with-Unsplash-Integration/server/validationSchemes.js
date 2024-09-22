var yup = require('yup');

// Custom validation for emails
yup.addMethod(yup.string, 'validEmail', function (message) {
    return this.test('validEmail', message, function (value) {
        const { path, createError } = this;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value) || createError({ path, message: message || 'Please enter a valid email address.' });
    });
});

/* Define the validation schemes for all of servers routes */
const schemes = {
    /* Validates the createProject POST request body */
    createProjectsSchema: yup.object({
        body: yup.object({
            name: yup.string().required(),
            summary: yup.string().min(20).max(80).required(),
            manager: yup.object({
                name: yup.string().required(), 
                email: yup.string().email().required().validEmail('Please enter a valid email address.'),
            }).required(),
            start_date: yup.number().required('Start date is required.'),
            team: yup.array().of(
                yup.object({
                    name: yup.string().required(),
                    email: yup.string().email().required().validEmail('Please enter a valid email address.'),
                    role: yup.string().required()
                })
            ).required().min(1),
        }),
    }),
    /* Validates the updateProject PUT request params and body */
    updateProjectsSchema: yup.object({
        params: yup.object({
            project_id: yup.string().length(13).required()
        }),
        body: yup.object({
            name: yup.string(),
            summary: yup.string().min(20).max(80),
            start_date: yup.number()
        }).test( 
            'at-least-one-field',
            'At least one field must be provided (name, summary, start_date).',
            value => {
                return value.name || value.summary || value.start_date !== undefined;
            }
        ),
    }),
    /* Validates the addImagesToProject PUT request params and body */
    addImagesToProjectSchema: yup.object({
        params: yup.object({
            project_id: yup.string().length(13).required(),
        }),
        body: yup.object({
            id: yup.string().required(),
            thumb: yup.string().url().required(),
            description: yup.string().required() 
        }),
    }),
    /* Validates the getProject GET request params */
    getProjectSchema: yup.object({
        params: yup.object({
            project_id: yup.string().length(13).required()
        }),
    }),
    /* Validates the deleteImageFromProject DELETE request params */
    deleteImageFromProjectSchema: yup.object({
        params: yup.object({
            project_id: yup.string().length(13).required(),
            img_id: yup.string().required()
        }),
    }),
    /* Validates the deleteProject DELETE request params */
    deleteProjectSchema: yup.object({
        params: yup.object({
            project_id: yup.string().length(13).required()
        }),
    }),

}
// Export the schemes
module.exports = schemes;