import React from 'react';
import { Form, Formik } from 'formik';
import { render, screen } from '@testing-library/react';
import { usePersonAttributeType } from './person-attributes.resource';
import { useConceptAnswers } from '../field.resource';
import { type FieldDefinition } from '../../../config-schema';
import { PersonAttributeField } from './person-attribute-field.component';

jest.mock('./person-attributes.resource');
jest.mock('../field.resource');

const mockedUsePersonAttributeType = usePersonAttributeType as jest.Mock;
const mockedUseConceptAnswers = useConceptAnswers as jest.Mock;

let fieldDefinition: FieldDefinition;

describe('PersonAttributeField', () => {
  let mockPersonAttributeType = {
    format: 'java.lang.String',
    display: 'Referred by',
    uuid: '4dd56a75-14ab-4148-8700-1f4f704dc5b0',
  };

  beforeEach(() => {
    fieldDefinition = {
      id: 'referredby',
      label: 'Referred by',
      type: 'person attribute',
      uuid: '4dd56a75-14ab-4148-8700-1f4f704dc5b0',
      answerConceptSetUuid: '6682d17f-0777-45e4-a39b-93f77eb3531c',
      validation: {
        matches: '',
        required: true,
      },
      showHeading: true,
    };
    mockedUsePersonAttributeType.mockReturnValue({
      data: mockPersonAttributeType,
      isLoading: false,
      error: null,
      uuid: '14d4f066-15f5-102d-96e4-000c29c2a5d7d',
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('renders the text input field for String format', () => {
    render(
      <Formik initialValues={{}} onSubmit={() => {}}>
        <Form>
          <PersonAttributeField fieldDefinition={fieldDefinition} />
        </Form>
      </Formik>,
    );

    const input = screen.getByLabelText(/Referred by/i) as HTMLInputElement;
    expect(screen.getByRole('heading')).toBeInTheDocument();
    expect(input).toBeInTheDocument();
    expect(input.type).toBe('text');
  });

  it('should not show heading if showHeading is false', () => {
    fieldDefinition = {
      ...fieldDefinition,
      showHeading: false,
    };

    render(
      <Formik initialValues={{}} onSubmit={() => {}}>
        <Form>
          <PersonAttributeField fieldDefinition={fieldDefinition} />
        </Form>
      </Formik>,
    );
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });

  it('renders the coded attribute field for Concept format', () => {
    mockedUsePersonAttributeType.mockReturnValue({
      data: { ...mockPersonAttributeType, format: 'org.openmrs.Concept' },
      isLoading: false,
      error: null,
    });

    fieldDefinition = {
      id: 'referredby',
      ...fieldDefinition,
      label: 'Referred by',
    };

    mockedUseConceptAnswers.mockReturnValueOnce({
      data: [
        { uuid: '1', display: 'Option 1' },
        { uuid: '2', display: 'Option 2' },
      ],
      isLoading: false,
    });

    render(
      <Formik initialValues={{}} onSubmit={() => {}}>
        <Form>
          <PersonAttributeField fieldDefinition={fieldDefinition} />
        </Form>
      </Formik>,
    );

    const input = screen.getByLabelText(/Referred by/i) as HTMLInputElement;
    expect(input).toBeInTheDocument();
    expect(input.type).toBe('select-one');
    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 2')).toBeInTheDocument();
  });

  it('renders an error notification if attribute type has unknown format', () => {
    mockedUsePersonAttributeType.mockReturnValue({
      data: { ...mockPersonAttributeType, format: 'unknown' },
      isLoading: false,
      error: null,
    });

    render(
      <Formik initialValues={{}} onSubmit={() => {}}>
        <Form>
          <PersonAttributeField fieldDefinition={fieldDefinition} />
        </Form>
      </Formik>,
    );

    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.getByText(/Patient attribute type has unknown format/i)).toBeInTheDocument();
  });

  it('renders an error notification if unable to fetch attribute type', () => {
    mockedUsePersonAttributeType.mockReturnValue({
      data: null,
      isLoading: false,
      error: new Error('Failed to fetch attribute type'),
    });

    fieldDefinition = {
      id: 'referredBy',
      uuid: 'attribute-uuid',
      label: 'Attribute',
      showHeading: false,
      type: 'person attribute',
    };

    render(
      <Formik initialValues={{}} onSubmit={() => {}}>
        <Form>
          <PersonAttributeField fieldDefinition={fieldDefinition} />
        </Form>
      </Formik>,
    );

    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.getByText(/Unable to fetch person attribute type/i)).toBeInTheDocument();
  });

  it('renders a skeleton if attribute type is loading', async () => {
    mockedUsePersonAttributeType.mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
    });

    fieldDefinition = {
      id: 'referredBy',
      uuid: 'attribute-uuid',
      label: 'Attribute',
      showHeading: true,
      type: 'person attribute',
    };

    render(
      <Formik initialValues={{}} onSubmit={() => {}}>
        <Form>
          <PersonAttributeField fieldDefinition={fieldDefinition} />
        </Form>
      </Formik>,
    );
    await screen.findByRole('heading', { name: /attribute/i });
    const input = screen.queryByLabelText(/Referred by/i);
    expect(input).not.toBeInTheDocument(); // checks that the input is not rendered when the attribute type is loading
  });
});
