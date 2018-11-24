package org.eclipse.leshan.client.master;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Arrays;
import java.util.List;
import java.util.Random;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

import org.eclipse.leshan.client.resource.BaseInstanceEnabler;
import org.eclipse.leshan.core.model.ObjectModel;
import org.eclipse.leshan.core.response.ExecuteResponse;
import org.eclipse.leshan.core.response.ReadResponse;
import org.eclipse.leshan.util.NamedThreadFactory;

public class RandomLoadSensor extends BaseInstanceEnabler {

    private static final String UNIT_KG = "kg";
    private static final int SENSOR_VALUE = 5700;
    private static final int UNITS = 5701;
    private static final int MAX_MEASURED_VALUE = 5602;
    private static final int MIN_MEASURED_VALUE = 5601;
    private static final int RESET_MIN_MAX_MEASURED_VALUES = 5605;
    private static final List<Integer> supportedResources = Arrays.asList(SENSOR_VALUE, UNITS, MAX_MEASURED_VALUE,
            MIN_MEASURED_VALUE, RESET_MIN_MAX_MEASURED_VALUES);
    private final ScheduledExecutorService scheduler;
    private final Random rng = new Random();
    private double currentLoad = 0.040d;
    private double minMeasuredValue = currentLoad;
    private double maxMeasuredValue = currentLoad;

    public RandomLoadSensor() {
        this.scheduler = Executors.newSingleThreadScheduledExecutor(new NamedThreadFactory("Load Sensor"));
        scheduler.scheduleAtFixedRate(new Runnable() {

            @Override
            public void run() {
                adjustLoad();
            }
        }, 2, 2, TimeUnit.SECONDS);
    }

    @Override
    public synchronized ReadResponse read(int resourceId) {
        switch (resourceId) {
        case MIN_MEASURED_VALUE:
            return ReadResponse.success(resourceId, getTwoDigitValue(minMeasuredValue));
        case MAX_MEASURED_VALUE:
            return ReadResponse.success(resourceId, getTwoDigitValue(maxMeasuredValue));
        case SENSOR_VALUE:
            return ReadResponse.success(resourceId, getTwoDigitValue(currentLoad));
        case UNITS:
            return ReadResponse.success(resourceId, UNIT_KG);
        default:
            return super.read(resourceId);
        }
    }

    @Override
    public synchronized ExecuteResponse execute(int resourceId, String params) {
        switch (resourceId) {
        case RESET_MIN_MAX_MEASURED_VALUES:
            resetMinMaxMeasuredValues();
            return ExecuteResponse.success();
        default:
            return super.execute(resourceId, params);
        }
    }

    private double getTwoDigitValue(double value) {
        BigDecimal toBeTruncated = BigDecimal.valueOf(value);
        return toBeTruncated.setScale(2, RoundingMode.HALF_UP).doubleValue();
    }

    private synchronized void adjustLoad() {
        float delta = (rng.nextInt(20) - 10) / 10f;
        currentLoad += delta;
        Integer changedResource = adjustMinMaxMeasuredValue(currentLoad);
        if (changedResource != null) {
            fireResourcesChange(SENSOR_VALUE, changedResource);
        } else {
            fireResourcesChange(SENSOR_VALUE);
        }
    }

    private Integer adjustMinMaxMeasuredValue(double newLoad) {

        if (newLoad > maxMeasuredValue) {
            maxMeasuredValue = newLoad;
            return MAX_MEASURED_VALUE;
        } else if (newLoad < minMeasuredValue) {
            minMeasuredValue = newLoad;
            return MIN_MEASURED_VALUE;
        } else {
            return null;
        }
    }

    private void resetMinMaxMeasuredValues() {
        minMeasuredValue = currentLoad;
        maxMeasuredValue = currentLoad;
    }

    @Override
    public List<Integer> getAvailableResourceIds(ObjectModel model) {
        return supportedResources;
    }
    
}
